const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const moment = require('moment');
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
    const studentId = req.user._id; // ✅ Use _id instead of id
    const studentProgram = req.user.program;

    console.log('🔍 startExam - Student ID:', studentId);
    console.log('🔍 startExam - Student Program:', studentProgram);

    // ✅ Validate studentId exists
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in request',
      });
    }
    // Validate examId format
    if (!examId || !examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format',
      });
    }

    // Fetch exam (lean for faster read)
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Program check
    if (exam.program && exam.program !== studentProgram) {
      return res.status(403).json({
        success: false,
        message: 'This exam is not for your program',
      });
    }

    // Parse date/time
    const examDate = moment(exam.date).format('YYYY-MM-DD');
    const examTime = exam.time instanceof Date ? moment(exam.time).format('HH:mm') : exam.time;
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

    const examDateTime = moment(`${examDate} ${examTime}`, 'YYYY-MM-DD HH:mm');
    if (!examDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse exam date or time',
      });
    }

    const now = moment();
    const examEndTime = examDateTime.clone().add(duration, 'minutes');

    if (now.isBefore(examDateTime)) {
      return res.status(403).json({
        success: false,
        message: `Your exam is scheduled for ${examDateTime.format('MMM DD, YYYY h:mm A')}. Please wait until the scheduled time.`,
      });
    }

    if (now.isAfter(examEndTime)) {
      return res.status(403).json({
        success: false,
        message: `The exam time window has expired. It ended at ${examEndTime.format('MMM DD, YYYY h:mm A')}.`,
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
          .lean(); // ✅ lean + faster
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

    const shuffledQuestions = questionsByCategory.map(shuffleArray).flat();

    const answerDoc = new Answer({
      studentId: studentId, // ✅ Now this will be properly set
      examId,
      answers: [],
      generatedQuestions: shuffledQuestions.map(q => q._id),
      startedAt: now.toDate(),
      totalQuestions: shuffledQuestions.length,
      status: 'in-progress', // ✅ This matches your enum
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

// Get available exams
const getExams = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentProgram = req.user.program;

    console.log('🔍 Student ID:', studentId);
    console.log('🔍 Student Program:', studentProgram);

    // Get submitted exam IDs
    const submittedExamIds = new Set(
      (await Answer.distinct('examId', { studentId, status: 'submitted' })).map(String)
    );

    // ✅ FIXED: Only show exams that match student's criteria
    const exams = await Exam.find({
      $and: [
        {
          $or: [
            { studentId: studentId }, // Student-specific exams
            { assignedTo: studentId }, // Assigned to this student
            { 
              $and: [
                { examType: 'general' }, // General exams
                { program: studentProgram } // For student's program
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
      const formattedDate = moment(exam.date).format('YYYY-MM-DD');
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

// Submit exam
const submitExam = async (req, res) => {
  try {
    console.log('🚀 Starting submitExam function');
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    console.log('📋 Request data:', { examId, studentId, answersCount: answers?.length });

    if (!examId || !examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format',
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array',
      });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const answerDoc = await Answer.findOne({ studentId, examId }).lean();
    if (!answerDoc) {
      return res.status(400).json({
        success: false,
        message: 'Exam not started or invalid session',
      });
    }

    if (answerDoc.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Exam has already been submitted',
      });
    }

    if (answerDoc.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Exam not in progress',
      });
    }

    // Validate time
    const startTime = new Date(answerDoc.startedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - startTime) / (1000 * 60));
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
        questionText: question.question, // Add question text from Question model
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

    // Calculate result
    const score = validationDetails.filter(d => d.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const status = score >= 40 ? 'pass' : 'fail';

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
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted, not started, or invalid session',
      });
    }

    // Log validationDetails for debugging
    console.log('📋 Validation Details:', validationDetails);

    res.json({
      success: true,
      message: 'Exam submitted successfully!',
      result: { score, totalQuestions, percentage, status },
    });
  } catch (err) {
    console.error('💥 Submission error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during exam submission',
    });
  }
};

// Get exam results
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

// Reset exam
const resetExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    if (!examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID format' });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const existingAnswer = await Answer.findOne({ studentId, examId }).lean();
    if (!existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'No exam session found to reset',
      });
    }

    if (existingAnswer.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reset a submitted exam',
      });
    }

    await Answer.deleteOne({ _id: existingAnswer._id });

    res.json({
      success: true,
      message: 'Exam reset successfully. You can now start it again.',
    });
  } catch (err) {
    console.error('Reset exam error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to reset exam' });
  }
};

module.exports = {
  getExams,
  startExam,
  getExamQuestions,
  submitExam,
  getResults,
  resetExam,
  getProfile,
};