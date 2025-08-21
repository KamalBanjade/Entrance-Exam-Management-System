const mongoose = require("mongoose");
const seedQuestions = require("../seed/seedQuestions"); // Adjust path if needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Run seeding only in development
    if (process.env.NODE_ENV === "development") {
      await seedQuestions();
    } else {
      
    }
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;