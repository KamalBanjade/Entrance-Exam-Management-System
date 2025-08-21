const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  answers: [{
    qId: { type: String, required: true },
    selected: { type: String, required: true }
  }],
  
  score: { 
    type: Number, 
    min: 0 
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  },
  percentage: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  result: {
    type: String,
    enum: ['pass', 'fail'],
    default: null  
  },

  status: { 
    type: String,
    enum: ['not-started', 'in-progress', 'submitted'],
    default: 'not-started',
    required: true
  },


  startedAt: Date,
  submittedAt: Date,

  rank: Number,

  validationDetails: [{
    questionId: String,
    questionText: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean
  }],

  congratulationSent: {
    type: Boolean,
    default: false,
  },

  // 🔁 Per-Student Question Order (Critical Fix!)
  generatedQuestions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }]

}, { 
  timestamps: true 
});

// 🔁 Add compound index to prevent duplicates
answerSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Answer", answerSchema);