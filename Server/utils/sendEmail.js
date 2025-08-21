const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject,  htmlContent, textContent) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      text: textContent, 
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email Error:", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
