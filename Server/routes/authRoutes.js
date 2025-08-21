
const express = require('express');
const router = express.Router();
const { 
  studentLogin, 
  adminLogin, 
  forgotPassword, 
  validateToken,
  checkStudentCredentials,
  resetPassword 
} = require('../controllers/authController'); 

// Existing routes
router.post('/student-login', studentLogin);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.get('/validate-token', validateToken);

// New routes
router.post('/check-student-credentials', checkStudentCredentials);
router.post('/reset-password', resetPassword);

module.exports = router;