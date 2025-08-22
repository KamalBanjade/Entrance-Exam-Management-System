const mongoose = require('mongoose');
const seedAdmin = require('../seed/seedAdmin');
const seedQuestions = require('../seed/seedQuestions');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    if (process.env.NODE_ENV === 'development' || process.env.SEED_DATA === 'true') {
      await seedAdmin();
      await seedQuestions();
    }
  } catch (err) {
    console.error('MongoDB Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;