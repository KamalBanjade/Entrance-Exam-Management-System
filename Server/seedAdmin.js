const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User"); // adjust path if needed

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin already exists:", existingAdmin.username);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new User({
      role: "admin",
      name: process.env.ADMIN_NAME || "System Admin",
      username: process.env.ADMIN_USERNAME || "admin",
      password: hashedPassword,
      dob: "2000-01-01", // placeholder if needed
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      phone: process.env.ADMIN_PHONE || "9800000000",
      program: null
    });

    await admin.save();
    console.log("🎉 Admin user seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
