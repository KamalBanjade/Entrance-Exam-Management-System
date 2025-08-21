
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  program: {
    type: String,
    enum: ["BCSIT", "BBA", "BCA"],
    required: function() {
      return !this.studentId;
    }
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['scheduled', 'running', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  // Add exam type to distinguish between the two
  examType: {
    type: String,
    enum: ['student-specific', 'general'],
    default: function() {
      return this.studentId ? 'student-specific' : 'general';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});
examSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.examType = this.studentId ? 'student-specific' : 'general';
  next();
});

module.exports = mongoose.model('Exam', examSchema);