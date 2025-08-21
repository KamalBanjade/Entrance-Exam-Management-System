const express = require("express");
const router = express.Router();
const Question = require('../models/Question')
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getAllStudents,  // This must match the exported name
  createStudent,
  updateStudent,
  deleteStudent,
  getAllExams,
  createExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getExamQuestions,
  addQuestionsToExam,
  getAllResults,
  downloadResultPDF,
  sendCongratulationEmail,
  updateExam,
  deleteExam,
  notifyStudents,
  getResultsByProgram,
  getquestionByProgram
} = require("../controllers/adminController");  // Verify this path is correct

// Protect all admin routes with authMiddleware for admin role
router.use(authMiddleware("admin"));

// Student routes
router.get("/users", getAllStudents);  // Now using the correct function
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.get("/exams", getAllExams);
router.post("/exams", createExam);
router.put("/exams/:id", updateExam)
router.delete("/exams/:id", deleteExam)
router.post("/questions", createQuestion);
router.put("/questions/:questionId", updateQuestion);
router.delete("/questions/:questionId", deleteQuestion);
router.get("/exams/:examId/questions", getExamQuestions);
router.post("/exams/:examId/questions", addQuestionsToExam);
router.get("/results", getAllResults); // Updated route
router.get("/results/:resultId/pdf", downloadResultPDF);
router.post("/results/:resultId/congratulation", sendCongratulationEmail);
router.post("/notify-students", notifyStudents)
router.get('/results', authMiddleware('admin'), getResultsByProgram)
router.get('/questions',getquestionByProgram)

module.exports = router;