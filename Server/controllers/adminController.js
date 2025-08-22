const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/sendEmail");
const examScheduler = require('../schedulers/examTimerScheduler');
const { generateEmailTemplate } = require('../utils/emailTemplates');
const { sendSMS } = require('../utils/smsService');
const mongoose = require("mongoose");
const moment = require('moment');

const createStudent = async (req, res) => {
  try {
    const { name, username, dob, email, phone, program, password, examTitle, examDate, examTime, examDuration } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim() }],
    });

    if (existingUser) {
      const field = existingUser.username === username.trim() ? 'username' : 'email';
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({
      name: name.trim(),
      username: username.trim(),
      dob,
      email: email.trim(),
      phone: phone?.trim() || null,
      program,
      password: hashedPassword,
      role: 'student',
    });

    let exam = null;
    if (examTitle && examDate && examTime && examDuration) {
      const moment = require('moment');
      const examDateTime = moment(`${examDate} ${examTime}`, 'YYYY-MM-DD HH:mm');

      exam = new Exam({
        title: examTitle.trim(),
        program,
        date: examDate,
        time: examTime,
        duration: parseInt(examDuration),
        status: "scheduled",
        studentId: student._id,
        examType: "student-specific",
        questions: [],
      });
    }

    const smsText = `Dear ${name.trim()},
          Welcome to Crimson College.

          Account Details:
          Username: ${username.trim()}
          Password: ${password}
          Program: ${program}

          ${examTitle ? `Exam Details:
          Title: ${examTitle.trim()}
          Date: ${examDate}
          Time: ${examTime}
          Duration: ${examDuration} min

          ` : ''}Thank you,
          CCT Team`;

    const plainText = `
      Dear ${name.trim()},

      Your student account has been successfully created! Welcome to Crimson College.

      Account Details:
      - Username: ${username.trim()}
      - Password: ${password}
      - Date of Birth: ${dob || 'Not provided'}
      - Program: ${program}

      ${examTitle ? `
      Exam Details:
      - Title: ${examTitle.trim()}
      - Date: ${examDate}
      - Time: ${examTime}
      - Duration: ${examDuration} minutes
      ` : ''}

      Please keep your password secure. For security, change your password after first login.
      Log in to view your exams: ${process.env.CLIENT_URL || 'https://your-exam-system.com/login'}

      Best regards,
      Crimson College Of Technology
          `.trim();

    // Prepare HTML email
    const loginUrl = process.env.CLIENT_URL || 'https://your-exam-system.com/login';
    const welcomeEmailContent = `
      <p class="greeting">Dear ${name.trim()},</p>
      <p>Your student account has been successfully created! Welcome to <strong>Crimson College</strong>.</p>

      <div class="details">
        <strong>Account Details:</strong><br/>
        • <strong>Username:</strong> ${username.trim()}<br/>
        • <strong>Password:</strong> ${password}<br/>
        • <strong>Date of Birth:</strong> ${dob || 'Not provided'}<br/>
        • <strong>Program:</strong> ${program}
      </div>

      ${examTitle ? `
      <div class="details">
        <strong>Exam Details:</strong><br/>
        • <strong>Title:</strong> ${examTitle.trim()}<br/>
        • <strong>Date:</strong> ${examDate}<br/>
        • <strong>Time:</strong> ${examTime}<br/>
        • <strong>Duration:</strong> ${examDuration} minutes
      </div>
      ` : ''}

      <p><strong>Note:</strong> For security, please change your password after your first login.</p>
      <p>Log in now to view your exams and prepare for success!</p>
      <a href="${loginUrl}" class="button">Log In Now</a>
    `;

    const emailHtml = generateEmailTemplate({
      title: `Welcome, ${name.trim()}!`,
      content: welcomeEmailContent,
      footer: `
        <p>Need help? Visit our <a href="https://support.crimsoncollege.edu">Help Center</a>.</p>
        <p>&copy; ${new Date().getFullYear()} Crimson College Of Technology</p>
      `,
    });

    try {
      await sendEmail(
        email.trim(),
        `Welcome to Crimson College, ${name.trim()}!`,
        emailHtml,
        plainText
      );
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send welcome email. Student account was not created. Please check the email address and try again.',
        error: 'Email delivery failed',
      });
    }

    await student.save();

    if (exam) {
      exam.studentId = student._id;
      await exam.save();
      const examScheduler = require('../schedulers/examTimerScheduler');
      if (exam.status === 'scheduled') {
        examScheduler.scheduleExam(exam);
      }
    }

    if (phone?.trim()) {
      try {
        await sendSMS(phone.trim(), smsText);
      } catch (smsError) {
        console.error('Failed to send welcome SMS:', smsError);
      }
    }
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student created successfully and welcome email sent!',
      student: studentResponse,
      examScheduled: !!exam,
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").lean();
    const studentsWithExams = await Promise.all(
      students.map(async (student) => {
        const exam = await Exam.findOne({
          studentId: student._id,
          examType: 'student-specific'
        }).select('title date time duration');

        return {
          ...student,
          exam: exam ? {
            examTitle: exam.title,
            examDate: exam.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            examTime: exam.time,
            examDuration: exam.duration,
          } : null,
        };
      })
    );

    res.status(200).json(studentsWithExams);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("studentId", "name username email program")
      .populate("questions")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: exams,
      count: exams.length,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, program, date, time, duration, status, studentId, examType } = req.body;

    if (!title || !program || !date || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title, program, date, time, and duration are required",
      });
    }

    const validPrograms = ["BCSIT", "BCA", "BBA"];
    if (!validPrograms.includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program. Must be one of: " + validPrograms.join(", "),
      });
    }

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    // 🎯 FIXED: Validate date and time format
    const moment = require('moment');
    const examDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');

    if (!examDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format. Use YYYY-MM-DD for date and HH:mm for time",
      });
    }

    // Check if exam time is in the future
    if (examDateTime.isBefore(moment())) {
      return res.status(400).json({
        success: false,
        message: "Exam date and time must be in the future",
      });
    }

    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID",
        });
      }
    }

    // Validate status if provided
    const validStatuses = ["scheduled", "running", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // 🎯 FIXED: Store date as proper Date object
    const exam = new Exam({
      title,
      program,
      date: examDateTime.format('YYYY-MM-DD'), // Store as string in YYYY-MM-DD format
      time, // Keep time as string in HH:mm format
      duration: parseInt(duration),
      status: status || "scheduled", // Default to "scheduled"
      studentId: studentId || null,
      examType: examType || (studentId ? "student-specific" : "general"),
      questions: [],
    });

    await exam.save();

    // 🎯 Schedule auto-start and auto-completion if exam is scheduled
    if (exam.status === 'scheduled') {
      examScheduler.scheduleExam(exam);
      console.log(`⏰ Scheduled auto-start and auto-completion for exam: "${exam.title}"`);
    }

    const populatedExam = await Exam.findById(exam._id)
      .populate("studentId", "name username email program");

    res.status(201).json({
      success: true,
      message: "Exam created successfully and scheduled for auto-start and auto-completion",
      exam: populatedExam,
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, program, date, time, duration, status, studentId, examType } = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }
    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID",
        });
      }
    }

    const wasActive = ['scheduled', 'running'].includes(exam.status);
    if (wasActive) {
      const cancelled = examScheduler.cancelExamTimers(id);
    }

    exam.title = title || exam.title;
    exam.program = program || exam.program;
    exam.date = date || exam.date;
    exam.time = time || exam.time;
    exam.duration = parseInt(duration) || exam.duration;
    exam.status = status || exam.status;
    exam.studentId = studentId || exam.studentId;
    exam.examType = examType || (studentId ? "student-specific" : "general");

    await exam.save();
    if (exam.status === 'scheduled') {
      examScheduler.scheduleExam(exam);
    } else if (wasActive && !['scheduled', 'running'].includes(exam.status)) {
      console.log(`📝 Exam "${exam.title}" is no longer active, timers removed`);
    }
    const populatedExam = await Exam.findById(exam._id)
      .populate("studentId", "name username email program");

    res.status(200).json({
      success: true,
      message: "Exam updated successfully and rescheduled",
      exam: populatedExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update exam",
      error: error.message,
    });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (['scheduled', 'running'].includes(exam.status)) {
      const cancelled = examScheduler.cancelExamTimers(id);
    }

    await Question.deleteMany({ examId: id });

    await Answer.deleteMany({ examId: id });

    await exam.deleteOne();

    res.status(200).json({
      success: true,
      message: "Exam and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exam",
      error: error.message,
    });
  }
};

const getActiveTimers = async (req, res) => {
  try {
    const timers = examScheduler.getActiveTimers();
    res.status(200).json({
      success: true,
      message: "Active exam timers retrieved",
      activeTimers: timers,
      count: timers.length
    });
  } catch (error) {
    console.error("Error getting active timers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active timers",
      error: error.message
    });
  }
};

const notifyStudents = async (req, res) => {
  try {
    const { examId, program } = req.body;
    if (!examId || !program) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and program are required',
      });
    }
    // In a real implementation, this could:
    // - Send WebSocket messages to students in the program
    // - Update a notification flag in the database
    // - Trigger an email or in-app notification
    res.status(200).json({
      success: true,
      message: 'Students notified successfully',
    });
  } catch (error) {
    console.error('Error notifying students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to notify students',
      error: error.message,
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, program } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length !== 4 || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "Question, exactly 4 options, and correct answer are required",
      });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the options",
      });
    }

    if (!['BCSIT', 'BCA', 'BBA'].includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Valid program (BCSIT, BCA, BBA) is required",
      });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category: category || 'General Awareness',
      program,
      // examId: null (optional — can be added later)
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options, correctAnswer, category } = req.body;

    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    if (options && (!Array.isArray(options) || options.length !== 4)) {
      return res.status(400).json({
        success: false,
        message: "Options must be an array of exactly 4 items",
      });
    }

    if (options && correctAnswer && !options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the provided options",
      });
    }

    existingQuestion.question = question || existingQuestion.question;
    existingQuestion.options = options || existingQuestion.options;
    existingQuestion.correctAnswer = correctAnswer || existingQuestion.correctAnswer;
    existingQuestion.category = category || existingQuestion.category;

    await existingQuestion.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: existingQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    await Exam.updateOne(
      { _id: question.examId },
      { $pull: { questions: questionId } }
    );

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
};

const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }
    const questions = await Question.find({});

    res.status(200).json({
      success: true,
      data: questions,
      count: questions.length,
      message: "Questions are same for all exams",
    });
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam questions",
      error: error.message,
    });
  }
};

const getquestionbyId = async (req, res) => {
  try {
    const { questionIds } = req.body;

    const questions = await Question.find({
      _id: { $in: questionIds }
    }).select('question options correctAnswer category');

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addQuestionsToExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions must be a non-empty array",
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Invalid question at index ${i}. Each question must have question text, exactly 4 options, and a correct answer.`,
        });
      }
      if (!q.options.includes(q.correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: `Correct answer for question at index ${i} must be one of the provided options.`,
        });
      }
    }

    const createdQuestions = [];
    for (const questionData of questions) {
      const question = new Question({
        examId,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        category: questionData.category || "General",
      });
      await question.save();
      createdQuestions.push(question._id);
    }

    exam.questions = [...exam.questions, ...createdQuestions];
    await exam.save();

    const updatedExam = await Exam.findById(examId)
      .populate("questions")
      .populate("studentId", "name username email program");

    res.status(200).json({
      success: true,
      message: "Questions added successfully",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Error adding questions to exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add questions to exam",
      error: error.message,
    });
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await Answer.find()
      .populate("studentId", "name username email program")
      .populate("examId", "title date time")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

const sendCongratulationEmail = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Answer.findById(resultId)
      .populate('studentId', 'name username email phone program')
      .populate('examId', 'title program date time');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    const studentEmail = result.studentId?.email;
    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Student email not available',
      });
    }

    if (result.congratulationSent) {
      return res.status(400).json({
        success: false,
        message: 'Congratulation email already sent',
      });
    }

    const smsText = `Dear ${result.studentId?.name || 'Student'},
Congratulations on your ${result.examId?.title} exam!

Result Summary:
Score: ${result.score ?? 0}/${result.totalQuestions ?? 0} (${result.percentage?.toFixed(2) ?? 0}%)
Status: ${result.result?.toUpperCase() || 'N/A'}
Program: ${result.studentId?.program || 'N/A'}

Thank you,
CCT Team`;

    const plainText = `
Dear ${result.studentId?.name || 'Student'},

Congratulations on your performance in the ${result.examId?.title} exam!

Result Summary:
- Program: ${result.studentId?.program || 'N/A'}
- Exam Date: ${result.examId?.date ? new Date(result.examId.date).toLocaleDateString() : 'N/A'}
- Score: ${result.score ?? 0}/${result.totalQuestions ?? 0} (${result.percentage?.toFixed(2) ?? 0}%)
- Status: ${result.result?.toUpperCase() || 'N/A'}

We are proud of your achievement and wish you continued success in your academic journey!

You can view your full result details by logging into your account.

Best regards,
Examination System Team
Crimson College Of Technology
    `.trim();
    const resultStatusColor = result.result === 'pass' ? '#228B22' : '#DC143C';
    const resultStatusBg = result.result === 'pass' ? '#d4edda' : '#f8d7da';
    const loginUrl = process.env.CLIENT_URL || 'https://your-exam-system.com/login';

    const congratulationEmailContent = `
      <p class="greeting">Dear ${result.studentId?.name || 'Student'},</p>

      <p style="font-size: 18px; color: #DC143C; font-weight: bold;">
        🎉 Congratulations on your performance in the <strong>${result.examId?.title}</strong> exam!
      </p>

      <div style="
        background: #fdf7f7;
        border-left: 4px solid ${resultStatusColor};
        padding: 15px;
        margin: 20px 0;
        border-radius: 6px;
        font-family: monospace;
        font-size: 14px;
        color: #555;
      ">
        <strong>Result Summary:</strong><br/>
        • <strong>Program:</strong> ${result.studentId?.program || 'N/A'}<br/>
        • <strong>Exam Date:</strong> ${result.examId?.date ? new Date(result.examId.date).toLocaleDateString() : 'N/A'}<br/>
        • <strong>Score:</strong> ${result.score ?? 0}/${result.totalQuestions ?? 0} (${result.percentage?.toFixed(2) ?? 0}%)<br/>
        • <strong>Status:</strong>
          <span style="
            background: ${resultStatusBg};
            color: ${resultStatusColor};
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          ">
            ${result.result?.toUpperCase() || 'N/A'}
          </span>
      </div>

      <p>We are proud of your achievement and wish you continued success in your academic journey!</p>

      <a href="${loginUrl}/results" class="button">View Full Result</a>

      <p style="margin-top: 20px; font-style: italic; color: #555;">
        Keep striving for excellence — your hard work is paying off!
      </p>
    `;

    const emailHtml = generateEmailTemplate({
      title: `Congratulations on Your ${result.examId?.title} Results!`,
      content: congratulationEmailContent,
      footer: `
        <p>You've made us proud! Keep up the great work.</p>
        <p>&copy; ${new Date().getFullYear()} Crimson College Of Technology</p>
      `,
    });

    const subject = `Congratulations on Your ${result.examId?.title} Results!`;

    try {
      await sendEmail(studentEmail, subject, emailHtml, plainText);
    } catch (emailError) {
      console.error('Failed to send congratulation email:', emailError);
    }
    const studentPhone = result.studentId?.phone;
    if (studentPhone) {
      try {
        await sendSMS(studentPhone, smsText);
      } catch (smsError) {
        console.error('Failed to send congratulation SMS:', smsError);
      }
    }
    result.congratulationSent = true;
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Congratulation email sent successfully',
      result,
    });
  } catch (error) {
    console.error('Error sending congratulation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send congratulation email',
      error: error.message,
    });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, phone, program, dob, examTitle, examDate, examTime, examDuration, password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID format' });
  }
  try {
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!username?.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (phone?.trim()) {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
      }
    }
    if (program && !['BCSIT', 'BCA', 'BBA'].includes(program)) {
      return res.status(400).json({ success: false, message: 'Invalid program. Must be BCSIT, BCA, or BBA' });
    }

    const updateData = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      ...(phone?.trim() && { phone: phone.trim() }),
      ...(dob && { dob }),
      ...(program && { program }),
      ...(password?.trim() && { password: password.trim() }),
    };
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: `Student not found with ID: ${id}` });
    }

    const hasExamDetails = examTitle?.trim() || examDate || examTime || examDuration;
    if (hasExamDetails) {
      if (!examTitle?.trim() || !examDate || !examTime || !examDuration) {
        return res.status(400).json({
          success: false,
          message: 'All exam fields (title, date, time, duration) are required if any are provided',
        });
      }

      const examDateTime = new Date(`${examDate} ${examTime}`);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (isNaN(examDateTime.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid exam date or time' });
      }
      if (examDateTime <= now) {
        return res.status(400).json({ success: false, message: 'Exam date and time must be in the future' });
      }
      if (examDateTime > oneYearFromNow) {
        return res.status(400).json({
          success: false,
          message: 'Exam date cannot be more than one year in the future',
        });
      }
      if (examDuration <= 0) {
        return res.status(400).json({ success: false, message: 'Exam duration must be greater than 0' });
      }
      await Exam.findOneAndUpdate(
        { studentId: id, examType: 'student-specific' },
        {
          title: examTitle.trim(),
          date: examDateTime,
          time: examTime,
          duration: examDuration,
          studentId: id,
          examType: 'student-specific',
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `The ${field} is already in use`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student',
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await Exam.deleteMany({ assignedTo: id });
    await Answer.deleteMany({ studentId: id });
    const deletedStudent = await User.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student and associated data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

const getResultsByProgram = async (req, res) => {
  try {
    const { program } = req.query;

    const filter = {};
    if (program && program !== 'all') {
      filter['studentId.program'] = program;
    }

    const results = await Answer.find(filter)
      .populate('studentId', 'name email program username')
      .populate('examId', 'title program date')
      .select('studentId examId score totalQuestions percentage status validationDetails congratulationSent createdAt')
      .sort({ score: -1 })
      .lean();
    const resultsWithRank = results.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));

    res.status(200).json(resultsWithRank);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
    });
  }
};

const getquestionByProgram = async (req, res) => {
  try {
    const { program } = req.query;

    let filter = {};
    if (program) {
      filter.program = program;
    }

    const questions = await Question.find(filter).sort({ category: 1, createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = {
  createStudent,
  getAllStudents,
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getExamQuestions,
  addQuestionsToExam,
  getAllResults,
  sendCongratulationEmail,
  updateStudent,
  deleteStudent,
  notifyStudents,
  getResultsByProgram,
  getActiveTimers,
  getquestionByProgram,
  getquestionbyId
};