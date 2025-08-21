const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [{ type: String, required: true }],
    required: true,
  },
  correctAnswer: { type: String, required: true },
  category: { type: String, default: "General Awareness" },
  program: {
    type: String,
    enum: ['BCSIT', 'BCA', 'BBA'],
    required: true,
  },
  examId: { 
    type: String, 
    required: false, // ← Now optional
    ref: 'Exam' 
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
