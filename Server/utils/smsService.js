const axios = require("axios");

const sendSMS = async (to, text) => {
  try {
    const response = await axios.post(process.env.SMS_API_URL, null, {
      params: {
        auth_token: process.env.SMS_AUTH_TOKEN,
        to,
        text,
      },
    });

    console.log("SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    throw new Error("Failed to send SMS");
  }
};

module.exports = { sendSMS };