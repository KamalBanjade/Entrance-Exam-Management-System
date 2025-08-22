
const bcrypt = require('bcryptjs');
const { cleanEnv, str, email, url } = require('envalid');
const User = require('../models/User');
require('dotenv').config();

const env = cleanEnv(process.env, {
  MONGO_URI: url(),
  ADMIN_USERNAME: str(),
  ADMIN_PASSWORD: str({ minLength: 8 }),
  ADMIN_EMAIL: email(),
  ADMIN_NAME: str({ default: 'System Admin' }),
  ADMIN_PHONE: str({ default: '9800000000' })
});

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ username: env.ADMIN_USERNAME });
    if (existingAdmin) {
      console.log('Admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const admin = new User({
      role: 'admin',
      name: env.ADMIN_NAME,
      username: env.ADMIN_USERNAME,
      password: hashedPassword,
      dob: '2000-01-01',
      email: env.ADMIN_EMAIL,
      phone: env.ADMIN_PHONE,
      program: null
    });

    await admin.save();
    console.log('✅ Admin user seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    throw err; 
  }
};

module.exports = seedAdmin;