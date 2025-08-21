const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

exports.studentLogin = async (req, res) => {
  const { username, password, dob } = req.body;
  
  console.log('Login attempt:', { username, dob }); // Debug log
  
  try {
    const student = await User.findOne({ username, role: "student" });
    if (!student) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log('Found student:', { 
      username: student.username, 
      storedDob: student.dob,
      receivedDob: dob,
      dobMatch: student.dob === dob 
    }); // Debug log

    const isMatch = await bcrypt.compare(password, student.password);
    console.log('Password match:', isMatch); // Debug log
    
    if (!isMatch || student.dob !== dob) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        program: student.program,
        email: student.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await User.findOne({ username, role: "admin" });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, username, dob } = req.body;

  try {
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found or invalid details" });
    }

    if (user.role === "student" && user.dob !== dob) {
      return res.status(400).json({ success: false, message: "Invalid date of birth" });
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send reset email
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const emailBody = `
      Dear ${user.name},

      You have requested to reset your password. Please click the link below to reset it:

      ${resetUrl}

      This link will expire in 1 hour. If you did not request a password reset, please ignore this email.

      Best regards,
      Administration Team
    `;

    await sendEmail(user.email, "Password Reset Request", emailBody);

    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        email: user.email,
        program: user.program || null,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
exports.checkStudentCredentials = async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Checking student credentials for:', username); // Debug log
  
  try {
    // Find user with username and student role
    const student = await User.findOne({ username, role: "student" });
    
    if (!student) {
      console.log('Student not found'); // Debug log
      return res.status(400).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, student.password);
    console.log('Password match for student check:', isMatch); // Debug log
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }

    // If we reach here, credentials are valid for a student
    console.log('Student credentials validated successfully'); // Debug log
    
    res.json({
      success: true,
      message: "Student credentials validated",
      requiresDateOfBirth: true // Indicate that DOB will be required for actual login
    });
    
  } catch (err) {
    console.error('Error checking student credentials:', err); // Debug log
    res.status(500).json({ 
      success: false, 
      message: "Server error during credential check" 
    });
  }
};
// Add this to your auth controller file (authController.js)

exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  
  console.log('Password reset attempt with token'); // Debug log (don't log the actual token)
  
  try {
    // Validate input
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    // Validate password strength (optional - adjust criteria as needed)
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully for user ID:', decoded.id); // Debug log
    } catch (tokenError) {
      console.log('Token verification failed:', tokenError.message); // Debug log
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for token'); // Debug log
      return res.status(400).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('User found:', user.username, 'Role:', user.role); // Debug log

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('New password hashed successfully'); // Debug log

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('Password updated successfully for user:', user.username); // Debug log

    // Send confirmation email (optional)
    try {
      const confirmationEmailBody = `
        Dear ${user.name},

        Your password has been successfully reset. If you did not make this change, please contact the administration immediately.

        Login Details:
        - Username: ${user.username}
        - Role: ${user.role === 'student' ? 'Student' : 'Administrator'}

        For security reasons, please log in with your new password and ensure your account is secure.

        Best regards,
        Administration Team
      `;

      await sendEmail(user.email, "Password Reset Confirmation", confirmationEmailBody);
      console.log('Confirmation email sent to:', user.email); // Debug log
    } catch (emailError) {
      console.log('Failed to send confirmation email:', emailError.message); // Debug log
      // Don't fail the password reset if email fails
    }

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
      userRole: user.role // Help frontend know which login flow to show
    });

  } catch (err) {
    console.error('Error resetting password:', err); // Debug log
    res.status(500).json({ 
      success: false, 
      message: "Server error during password reset" 
    });
  }
};