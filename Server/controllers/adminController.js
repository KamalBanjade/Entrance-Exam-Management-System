const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/sendEmail");
const examScheduler = require('../schedulers/examTimerScheduler');
const { generateEmailTemplate } = require('../utils/emailTemplates');
const { sendSMS } = require('../utils/smsService');

// Backend Controller - Enhanced createStudent function
const createStudent = async (req, res) => {
  try {
    const { name, username, dob, email, phone, program, password, examTitle, examDate, examTime, examDuration } = req.body;

    // ===== VALIDATION SECTION =====
    
    // Required field validation
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!username?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!program) {
      return res.status(400).json({
        success: false,
        message: 'Program selection is required',
      });
    }

    if (!password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Phone validation (if provided)
    if (phone && phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number',
        });
      }
    }

    // Program validation
    const validPrograms = ['BCSIT', 'BCA', 'BBA'];
    if (!validPrograms.includes(program)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid program (BCSIT, BCA, or BBA)',
      });
    }

    // Date of birth validation (if provided)
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      const maxAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
      
      if (dobDate > minAge) {
        return res.status(400).json({
          success: false,
          message: 'Student must be at least 16 years old',
        });
      }
      
      if (dobDate < maxAge) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid date of birth',
        });
      }
    }

    // Exam validation (if exam details provided)
    if (examTitle || examDate || examTime || examDuration) {
      if (!examTitle?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Exam title is required when scheduling an exam',
        });
      }

      if (!examDate) {
        return res.status(400).json({
          success: false,
          message: 'Exam date is required when scheduling an exam',
        });
      }

      if (!examTime) {
        return res.status(400).json({
          success: false,
          message: 'Exam time is required when scheduling an exam',
        });
      }

      if (!examDuration || examDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Exam duration must be greater than 0 minutes',
        });
      }

      // Validate exam date is in future
      const moment = require('moment');
      const examDateTime = moment(`${examDate} ${examTime}`, 'YYYY-MM-DD HH:mm');
      const now = moment();
      
      if (!examDateTime.isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid exam date and time',
        });
      }

      if (examDateTime.isBefore(now)) {
        return res.status(400).json({
          success: false,
          message: 'Exam date and time must be in the future',
        });
      }

      // Validate exam is not too far in future (optional - 1 year limit)
      const oneYearFromNow = moment().add(1, 'year');
      if (examDateTime.isAfter(oneYearFromNow)) {
        return res.status(400).json({
          success: false,
          message: 'Exam date cannot be more than one year in the future',
        });
      }
    }

    // Check for existing user
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

    // ===== STUDENT CREATION =====
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

    // ===== EXAM CREATION (if provided) =====
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

    // ===== EMAIL PREPARATION =====
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

    // ===== CRITICAL: SEND EMAIL FIRST =====
    try {
      await sendEmail(
        email.trim(),
        `Welcome to Crimson College, ${name.trim()}!`,
        emailHtml,
        plainText
      );
      console.log('✅ Welcome email sent successfully to:', email.trim());
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send welcome email. Student account was not created. Please check the email address and try again.',
        error: 'Email delivery failed',
      });
    }

    // ===== SAVE STUDENT (only after successful email) =====
    await student.save();
    console.log('✅ Student saved successfully:', student.username);

    // ===== SAVE EXAM (if provided) =====
    if (exam) {
      exam.studentId = student._id; // Update with actual student ID
      await exam.save();
      console.log('✅ Exam saved successfully:', exam.title);

      // Schedule the exam
      const examScheduler = require('../schedulers/examTimerScheduler');
      if (exam.status === 'scheduled') {
        examScheduler.scheduleExam(exam);
        console.log(`⏰ Scheduled auto-start and auto-completion for student exam: "${exam.title}"`);
      }
    }

    // ===== SEND SMS (optional, after successful save) =====
    if (phone?.trim()) {
      try {
        await sendSMS(phone.trim(), smsText);
        console.log('✅ Welcome SMS sent successfully to:', phone.trim());
      } catch (smsError) {
        console.error('⚠️ Failed to send welcome SMS (student still created):', smsError);
        // Don't fail the request if SMS fails, just log it
      }
    }

    // ===== SUCCESS RESPONSE =====
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student created successfully and welcome email sent!',
      student: studentResponse,
      examScheduled: !!exam,
    });

  } catch (error) {
    console.error('❌ Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// Get all exams
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

// Updated updateExam function with timer rescheduling
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, program, date, time, duration, status, studentId, examType } = req.body;

    // Find exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Validate required fields
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

    // 🎯 Cancel existing timers before updating
    const wasActive = ['scheduled', 'running'].includes(exam.status);
    if (wasActive) {
      const cancelled = examScheduler.cancelExamTimers(id);
      if (cancelled) {
        console.log(`🚫 Cancelled existing timers for exam: "${exam.title}"`);
      }
    }

    // Update fields
    exam.title = title || exam.title;
    exam.program = program || exam.program;
    exam.date = date || exam.date; // Store as string
    exam.time = time || exam.time; // Store as string
    exam.duration = parseInt(duration) || exam.duration;
    exam.status = status || exam.status;
    exam.studentId = studentId || exam.studentId;
    exam.examType = examType || (studentId ? "student-specific" : "general");

    await exam.save();

    // 🎯 Reschedule if exam is now scheduled
    if (exam.status === 'scheduled') {
      examScheduler.scheduleExam(exam);
      console.log(`⏰ Rescheduled auto-start and auto-completion for exam: "${exam.title}"`);
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

// Delete exam function with timer cleanup
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Find exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Cancel timers if exam was active
    if (['scheduled', 'running'].includes(exam.status)) {
      const cancelled = examScheduler.cancelExamTimers(id);
      if (cancelled) {
        console.log(`🚫 Cancelled timers for deleted exam: "${exam.title}"`);
      }
    }

    // Delete associated questions
    await Question.deleteMany({ examId: id });

    // Delete associated answers
    await Answer.deleteMany({ examId: id });

    // Delete exam
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

// 🎯 NEW: Debug function to see active timers
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
    console.log(`Notifying students in program ${program} for exam ${examId}`);

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
// Create a new question
const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, program } = req.body;

    // Validate required fields (examId is NOT required)
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

// Update a question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options, correctAnswer, category } = req.body;

    // Find question
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Validate options if provided
    if (options && (!Array.isArray(options) || options.length !== 4)) {
      return res.status(400).json({
        success: false,
        message: "Options must be an array of exactly 4 items",
      });
    }

    // Verify correctAnswer is one of the options if both are provided
    if (options && correctAnswer && !options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the provided options",
      });
    }

    // Update fields
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

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Find question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Remove question from exam
    await Exam.updateOne(
      { _id: question.examId },
      { $pull: { questions: questionId } }
    );

    // Delete question
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

// Get exam questions
const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Get ALL questions since they're the same for everyone
    const questions = await Question.find({});

    console.log(`📊 Returning ${questions.length} questions for exam: ${exam.title}`);

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

// Add questions to an exam
const addQuestionsToExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = req.body;

    // Validate examId
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions must be a non-empty array",
      });
    }

    // Validate each question
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

    // Create questions
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

    // Update exam with question IDs
    exam.questions = [...exam.questions, ...createdQuestions];
    await exam.save();

    // Return updated exam with populated questions
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

// Get all results
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

// Download result PDF (placeholder)
const downloadResultPDF = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Answer.findById(resultId)
      .populate("studentId", "name username email program")
      .populate("examId", "title program date time");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PDF generation not implemented yet",
      result,
    });
  } catch (error) {
    console.error("Error downloading result PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download result PDF",
      error: error.message,
    });
  }
};


const sendCongratulationEmail = async (req, res) => {
  try {
    const { resultId } = req.params;

    // Fetch result with populated student and exam details
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

    // Check if congratulation was already sent
    if (result.congratulationSent) {
      return res.status(400).json({
        success: false,
        message: 'Congratulation email already sent',
      });
    }

    // --- SMS Content ---
    const smsText = `Dear ${result.studentId?.name || 'Student'},
Congratulations on your ${result.examId?.title} exam!

Result Summary:
Score: ${result.score ?? 0}/${result.totalQuestions ?? 0} (${result.percentage?.toFixed(2) ?? 0}%)
Status: ${result.result?.toUpperCase() || 'N/A'}
Program: ${result.studentId?.program || 'N/A'}

Thank you,
CCT Team`;

    // --- Plain Text Version (Fallback) ---
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

    // --- HTML Email Content ---
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

    // --- Send Email ---
    const subject = `Congratulations on Your ${result.examId?.title} Results!`;

    try {
      await sendEmail(studentEmail, subject, emailHtml, plainText);
    } catch (emailError) {
      console.error('Failed to send congratulation email:', emailError);
    }

    // --- Send SMS ---
    const studentPhone = result.studentId?.phone;
    if (studentPhone) {
      try {
        await sendSMS(studentPhone, smsText);
        console.log('Congratulation SMS sent successfully to:', studentPhone);
      } catch (smsError) {
        console.error('Failed to send congratulation SMS:', smsError);
      }
    }

    // Mark as sent
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
  try {
    const { id } = req.params;
    const { examTitle, examDate, examTime, examDuration, program, ...updateData } = req.body;

    // Don't allow role changing
    if (updateData.role && updateData.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: "Cannot change user role",
      });
    }

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    // Update student data
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Handle exam update/creation
    if (examTitle && examDate && examTime && examDuration) {
      const examDateTime = moment(`${examDate} ${examTime}`, 'YYYY-MM-DD HH:mm');
      
      // Validate exam date and time format
      if (!examDateTime.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam date or time format",
        });
      }

      // Check if student already has an exam
      let existingExam = await Exam.findOne({ studentId: id });

      if (existingExam) {
        // Cancel existing timers
        examScheduler.cancelExamTimers(existingExam._id);

        // Update existing exam
        existingExam.title = examTitle;
        existingExam.program = program;
        existingExam.date = examDate;
        existingExam.time = examTime;
        existingExam.duration = parseInt(examDuration);
        existingExam.status = "scheduled";

        await existingExam.save();

        // Reschedule the updated exam
        examScheduler.scheduleExam(existingExam);
        console.log(`⏰ Rescheduled exam for student: "${existingExam.title}"`);
      } else {
        // Create new exam
        const exam = new Exam({
          title: examTitle,
          program,
          date: examDate,
          time: examTime,
          duration: parseInt(examDuration),
          status: "scheduled",
          studentId: id,
          examType: "student-specific",
          questions: [],
        });

        await exam.save();

        // Schedule the new exam
        examScheduler.scheduleExam(exam);
        console.log(`⏰ Scheduled new exam for student: "${exam.title}"`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated exams and answers
    await Exam.deleteMany({ assignedTo: id });
    await Answer.deleteMany({ studentId: id });

    // Delete the student
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
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};
const getResultsByProgram = async (req, res) => {
  try {
    // Get program from query params: ?program=BCSIT
    const { program } = req.query;

    // Build filter
    const filter = {};
    if (program && program !== 'all') {
      filter['studentId.program'] = program;
    }

    // Fetch results with populated data
    const results = await Answer.find(filter)
      .populate('studentId', 'name email program username')
      .populate('examId', 'title program date')
      .select('studentId examId score totalQuestions percentage status validationDetails congratulationSent createdAt')
      .sort({ score: -1 }) // Highest score first
      .lean(); // Optional: easier to modify (like adding rank)

    // Add rank based on score order
    const resultsWithRank = results.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));

    res.status(200).json(resultsWithRank);
  } catch (error) {
    console.error('Error fetching results:', error);
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
    console.error('Error fetching questions by program:', error);
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
  downloadResultPDF,
  sendCongratulationEmail,
  updateStudent,
  deleteStudent,
  notifyStudents,
  getResultsByProgram,
  getActiveTimers,
  getquestionByProgram
};