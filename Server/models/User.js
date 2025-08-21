const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["admin", "student"], required: true },
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  dob: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?\d{10,15}$/, "Please enter a valid phone number"],
  },
  program: {
    type: String,
    enum: ["BCSIT", "BCA", "BBA", null],
    required: function () {
      return this.role === "student";
    },
  },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);