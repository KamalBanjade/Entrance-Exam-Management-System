// routes/studentRoutes.js

const express = require("express");
const {
  getExams,
  startExam,
  getExamQuestions,
  submitExam,
  getResults,
  getProfile, 
} = require("../controllers/studentController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/exams', authMiddleware("student"), getExams);
router.post('/start-exam/:examId', authMiddleware("student"), startExam);
router.get('/exam/:examId/questions', authMiddleware("student"), getExamQuestions);
router.post('/submit-exam', authMiddleware("student"), submitExam);
router.get('/results', authMiddleware("student"), getResults);
router.get('/profile', authMiddleware("student"), getProfile);

module.exports = router;