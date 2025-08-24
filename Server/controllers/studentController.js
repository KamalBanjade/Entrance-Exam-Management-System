const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const moment = require('moment-timezone'); // Replace regular moment
const shuffleArray = require('shuffle-array');

// Get authenticated user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;
    const studentProgram = req.user.program;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in request',
      });
    }

    if (!examId || !examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format',
      });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    if (exam.program && exam.program !== studentProgram) {
      return res.status(403).json({
        success: false,
        message: 'This exam is not for your program',
      });
    }

    const examDate = moment.tz(exam.date, 'Asia/Kathmandu').format('YYYY-MM-DD');
    const examTime = exam.time instanceof Date ?
      moment.tz(exam.time, 'Asia/Kathmandu').format('HH:mm') : exam.time;
    const duration = parseInt(exam.duration, 10);

    if (!examDate.match(/^\d{4}-\d{2}-\d{2}$/) || !examTime.match(/^\d{2}:\d{2}$/)) {
      return res.status(400).json({
        success: false,
        message: `Invalid date/time format: date=${examDate}, time=${examTime}`,
      });
    }

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Exam duration must be a positive number',
      });
    }

    // 🔥 FIX: Use Asia/Kathmandu timezone consistently in backend
    const examDateTime = moment.tz(`${examDate} ${examTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kathmandu');
    if (!examDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse exam date or time',
      });
    }

    const now = moment.tz('Asia/Kathmandu'); // 🔥 Changed to Asia/Kathmandu
    const examEndTime = examDateTime.clone().add(duration, 'minutes');
    const examStartWithBuffer = examDateTime.clone().subtract(5, 'minutes');
    const examEndWithBuffer = examEndTime.clone().add(5, 'minutes');

    console.log('⏰ Backend time validation (Asia/Kathmandu):', {
      examTitle: exam.title,
      currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
      examStart: examDateTime.format('YYYY-MM-DD HH:mm:ss'),
      examEnd: examEndTime.format('YYYY-MM-DD HH:mm:ss'),
      startBuffer: examStartWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
      endBuffer: examEndWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
      isAfterStart: now.isAfter(examStartWithBuffer),
      isBeforeEnd: now.isBefore(examEndWithBuffer),
      isInWindow: now.isBetween(examStartWithBuffer, examEndWithBuffer),
      timezone: 'Asia/Kathmandu'
    });

    if (now.isBefore(examStartWithBuffer)) {
      return res.status(403).json({
        success: false,
        message: `Your exam is scheduled for ${examDateTime.format('MMM DD, YYYY h:mm A')}. Please wait until the scheduled time.`,
        debug: {
          currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
          examStart: examStartWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
          timezone: 'Asia/Kathmandu',
          reason: 'too_early'
        }
      });
    }

    if (now.isAfter(examEndWithBuffer)) {
      return res.status(403).json({
        success: false,
        message: `The exam time window has expired. It ended at ${examEndTime.format('MMM DD, YYYY h:mm A')}.`,
        debug: {
          currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
          examEnd: examEndWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
          timezone: 'Asia/Kathmandu',
          reason: 'too_late'
        }
      });
    }

    // Check for existing answer session
    const existingAnswer = await Answer.findOne({ studentId, examId }).lean();
    if (existingAnswer && existingAnswer.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
      });
    } else if (existingAnswer) {
      return res.status(200).json({
        success: true,
        message: 'Exam already started, you can resume',
        exam: {
          _id: exam._id,
          title: exam.title,
          duration: exam.duration,
          program: exam.program,
          startedAt: existingAnswer.startedAt,
          questions: existingAnswer.generatedQuestions || exam.questions,
        },
      });
    }

    // Fetch and shuffle 25 questions per category
    const categories = ['Verbal Ability', 'Quantitative Aptitude', 'Logical Reasoning', 'General Awareness'];

    const questionsByCategory = await Promise.all(
      categories.map(async (category) => {
        return await Question.find({
          $or: [
            { program: studentProgram, category },
            { program: 'General', category }
          ]
        })
          .select('-correctAnswer')
          .limit(25)
          .lean();
      })
    );

    for (let i = 0; i < categories.length; i++) {
      if (questionsByCategory[i].length < 25) {
        return res.status(404).json({
          success: false,
          message: `Not enough questions for ${categories[i]} (found ${questionsByCategory[i].length}, required 25)`,
        });
      }
    }

    // Simple shuffle function if not available
    const shuffle = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledQuestions = questionsByCategory.map(shuffle).flat();

    const answerDoc = new Answer({
      studentId: studentId,
      examId,
      answers: [],
      generatedQuestions: shuffledQuestions.map(q => q._id),
      startedAt: now.toDate(), // This will be in Asia/Kathmandu time
      totalQuestions: shuffledQuestions.length,
      status: 'in-progress',
    });

    await answerDoc.save();

    res.json({
      success: true,
      message: 'Exam started successfully',
      exam: {
        _id: exam._id,
        title: exam.title,
        duration,
        program: exam.program,
        startedAt: now.toDate(),
        questions: shuffledQuestions.map(q => q._id),
      },
    });
  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during exam start',
      error: err.message,
    });
  }
};

const getExams = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentProgram = req.user.program;

    const submittedExamIds = new Set(
      (await Answer.distinct('examId', { studentId, status: 'submitted' })).map(String)
    );

    const exams = await Exam.find({
      $and: [
        {
          $or: [
            { studentId: studentId },
            { assignedTo: studentId },
            {
              $and: [
                { examType: 'general' },
                { program: studentProgram }
              ]
            }
          ]
        },
        { status: { $ne: 'cancelled' } }
      ]
    })
      .populate('questions', '_id')
      .lean();

    console.log('📊 Filtered exams for student:', exams.length);

    const formattedExams = exams.map(exam => {
      // 🔥 Use Asia/Kathmandu timezone for date formatting
      const formattedDate = moment.tz(exam.date, 'Asia/Kathmandu').format('YYYY-MM-DD');
      const isSubmitted = submittedExamIds.has(exam._id.toString());

      return {
        _id: exam._id,
        title: exam.title,
        date: formattedDate,
        time: exam.time,
        duration: exam.duration.toString(),
        program: exam.program,
        status: isSubmitted ? 'completed' : exam.status,
        questionsCount: exam.questions.length,
      };
    });

    res.json({
      success: true,
      exams: formattedExams,
    });
  } catch (err) {
    console.error('❌ Get exams error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get questions for started exam
const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Use req.user.program directly
    if (exam.program && exam.program !== req.user.program) {
      return res.status(403).json({
        success: false,
        message: `This exam is for ${exam.program} students only. You are enrolled in ${req.user.program}.`,
      });
    }

    const answerDoc = await Answer.findOne({ studentId, examId }).lean();
    if (!answerDoc) {
      return res.status(400).json({
        success: false,
        message: 'Exam not started. Please start the exam first.',
      });
    }

    if (answerDoc.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted. You cannot access questions anymore.',
      });
    }

    if (!answerDoc.generatedQuestions?.length) {
      return res.status(400).json({
        success: false,
        message: 'No questions assigned to this exam session',
      });
    }

    const questions = await Question.find({
      _id: { $in: answerDoc.generatedQuestions }
    })
      .select('-correctAnswer')
      .lean();

    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    const orderedQuestions = answerDoc.generatedQuestions
      .map(id => questionMap.get(id.toString()))
      .filter(Boolean);

    res.json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        duration: exam.duration,
        startedAt: answerDoc.startedAt,
        program: req.user.program,
      },
      questions: orderedQuestions,
      message: `Loaded ${orderedQuestions.length} questions for ${req.user.program} program`,
    });
  } catch (err) {
    console.error('Get exam questions error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const submitExam = async (req, res) => {
  try {
    console.log('🚀 Starting submitExam function');
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    console.log('📋 Request data:', { examId, studentId, answersCount: answers?.length });

    // Validate examId format
    if (!examId || !examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format',
      });
    }

    // Validate answers array
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array',
      });
    }

    // Check exam existence
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check Answer document
    const answerDoc = await Answer.findOne({ studentId, examId }).lean();
    if (!answerDoc) {
      return res.status(400).json({
        success: false,
        message: 'Exam not started or invalid session',
      });
    }

    // Check if already submitted
    if (answerDoc.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
        alreadySubmitted: true,
      });
    }

    // Check if exam is in progress
    if (answerDoc.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Exam not in progress',
      });
    }

    const startTime = moment.tz(answerDoc.startedAt, 'Asia/Kathmandu');
    const now = moment.tz('Asia/Kathmandu');
    const diffMinutes = now.diff(startTime, 'minutes');

    if (diffMinutes > exam.duration) {
      return res.status(400).json({
        success: false,
        message: `Exam duration exceeded. Time limit was ${exam.duration} minutes.`,
      });
    }

    // Fetch questions
    const questionIds = answerDoc.generatedQuestions || exam.questions;
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions found',
      });
    }

    // Validate answers
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    const validAnswers = [];
    const validationDetails = [];

    for (const answer of answers) {
      if (!answer?.qId || !answer.selected) continue;

      const question = questionMap.get(answer.qId.toString());
      if (!question) continue;
      if (!question.options?.includes(answer.selected)) continue;

      validAnswers.push({ qId: answer.qId, selected: answer.selected });

      const isCorrect = answer.selected === question.correctAnswer;
      validationDetails.push({
        questionId: question._id.toString(),
        questionText: question.question,
        selectedAnswer: answer.selected,
        correctAnswer: question.correctAnswer,
        isCorrect,
      });
    }

    if (validAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid answers provided',
      });
    }

    // Calculate results
    const score = validationDetails.filter(d => d.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const status = score >= 40 ? 'pass' : 'fail';

    // Update Answer document
    const result = await Answer.updateOne(
      { studentId, examId, status: 'in-progress' },
      {
        $set: {
          answers: validAnswers,
          score,
          totalQuestions,
          percentage,
          result: status,
          status: 'submitted',
          submittedAt: new Date(),
          validationDetails,
        },
      },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted or invalid session',
        alreadySubmitted: result.matchedCount === 0 && (await Answer.findOne({ studentId, examId, status: 'submitted' })) ? true : false,
      });
    }

    // Update Exam status to 'completed' for student-specific exams
    if (exam.examType === 'student-specific' || exam.isStudentSpecific) {
      await Exam.updateOne(
        { _id: examId },
        { $set: { status: 'completed' } }
      );
      console.log(`Updated exam ${examId} status to 'completed' for student-specific exam`);
    }

    res.json({
      success: true,
      message: 'Exam submitted successfully!',
      result: { score, totalQuestions, percentage, status },
    });
  } catch (err) {
    console.error('Error in submitExam:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during exam submission',
    });
  }
};

const getResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    const results = await Answer.find(
      { studentId, submittedAt: { $ne: null } },
      'examId score totalQuestions percentage result status submittedAt'
    )
      .populate('examId', 'title date time duration')
      .sort({ submittedAt: -1 })
      .lean();

    const formattedResults = results.map(result => ({
      _id: result._id,
      examTitle: result.examId.title,
      examDate: result.examId.date,
      examTime: result.examId.time,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      status: result.result,
      submittedAt: result.submittedAt,
    }));

    res.json({
      success: true,
      results: formattedResults,
    });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports = {
  getExams,
  startExam,
  getExamQuestions,
  submitExam,
  getResults,
  getProfile,
};