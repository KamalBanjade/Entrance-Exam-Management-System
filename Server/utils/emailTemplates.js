// utils/emailTemplate.js
const generateEmailTemplate = ({ title, content, footer }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(to right, #DC143C, #B2102F);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .logo {
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px auto;
      font-size: 24px;
      font-weight: bold;
      color: #DC143C;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .details {
      background: #fdf7f7;
      border-left: 4px solid #DC143C;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-size: 14px;
      color: #555;
    }
    .details strong {
      color: #DC143C;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #DC143C;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
    }
    .button:hover {
      background-color: #B2102F;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      background-color: #f1f1f1;
      border-top: 1px solid #ddd;
    }
    .footer a {
      color: #DC143C;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 10px;
      }
      .content, .header {
        padding: 20px;
      }
      .greeting {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Crimson College Of Technology</h1>
      <p>Examination Management System</p>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      ${footer || `
        <p>&copy; ${new Date().getFullYear()} Crimson College Of Technology. All rights reserved.</p>
        <p>Contact: <a href="mailto:support@crimsoncollege.edu">support@crimsoncollege.edu</a></p>
      `}
    </div>
  </div>
</body>
</html>
`;

module.exports = { generateEmailTemplate };