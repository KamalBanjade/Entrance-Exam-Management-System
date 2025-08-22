const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

exports.studentLogin = async (req, res) => {
  const { username, password, dob } = req.body;

  try {
    const student = await User.findOne({ username, role: "student" });
    if (!student) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }


    const isMatch = await bcrypt.compare(password, student.password);

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

  try {
    const student = await User.findOne({ username, role: "student" });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      message: "Student credentials validated",
      requiresDateOfBirth: true
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during credential check"
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  try {
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('New password hashed successfully');

    user.password = hashedPassword;
    await user.save();
    try {
      const confirmationEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC143C 0%, #c41234 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #F5F5F5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666666; }
        .button { display: inline-block; background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; transition: all 0.3s; }
        .button:hover { background: #c41234; }
        .info-box { background: #F5F5F5; border-left: 4px solid #DC143C; padding: 15px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #DC143C; padding: 15px; margin: 20px 0; }
        .brand-color { color: #DC143C; }
        .text-gray { color: #666666; }
        .logo-section { text-align: center; margin-bottom: 20px; }
        .college-name { font-size: 24px; font-weight: bold; color: #333; margin: 10px 0 5px 0; }
        .college-subtitle { font-size: 14px; color: #666666; font-style: italic; margin-bottom: 15px; }
        .divider { height: 2px; background: #DC143C; width: 60px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-section">
                <h1 class="college-name" style="color: white; margin: 0;">Crimson College</h1>
                <p class="college-subtitle" style="color: rgba(255,255,255,0.9); margin: 5px 0;">Of Technology</p>
                <div class="divider" style="background: white; margin: 15px auto;"></div>
            </div>
            <h1 style="margin: 0; font-size: 24px;">Password Reset Confirmation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been updated successfully</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>We're writing to confirm that your password has been successfully reset. Your account is now ready to use with the new credentials.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0;" class="brand-color">📋 Your Account Details</h3>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role === 'student' ? 'Student' : 'Administrator'}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
            </div>
            
            <div class="warning">
                <h3 style="margin-top: 0;" class="brand-color">🔒 Security Notice</h3>
                <p><strong>If you did not request this password reset</strong>, please contact our administration team immediately at <a href="mailto:admin@crimsontech.edu.np" style="color: #DC143C;">admin@crimsontech.edu.np</a> or call our support line.</p>
            </div>
            
            <h3 class="brand-color">Next Steps:</h3>
            <ul style="padding-left: 20px; color: #666666;">
                <li>Log in using your new password</li>
                <li>Ensure your account information is up to date</li>
                <li>Consider enabling additional security features</li>
                <li>Keep your login credentials secure and confidential</li>
            </ul>
            
            <p class="text-gray">If you experience any issues accessing your account or have questions about our services, please don't hesitate to reach out to our support team.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Access Your Account</a>
            </div>
            
            <p style="margin-top: 30px;">Thank you for being a valued member of our community.</p>
        </div>
        
        <div class="footer">
            <p><strong>Administration Team</strong><br>
            <span class="brand-color">Crimson College of Technology</span><br>
            📧 info@cct.edu.np | 📞 071410380</p>
            <p style="margin-top: 15px; color: #999;">
                This is an automated message. Please do not reply to this email.<br>
                © ${new Date().getFullYear()} Crimson College of Technology. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

      await sendEmail(user.email, "Password Reset Confirmation", confirmationEmailBody);
    } catch (emailError) {
    }

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
      userRole: user.role
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset"
    });
  }
};