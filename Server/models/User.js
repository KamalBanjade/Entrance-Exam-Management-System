const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ["admin", "student"], 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  dob: {
    type: String,
    // No required field to make it optional
  },
  email: {
    type: String,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    // No required field to make it optional
  },
  phone: {
    type: String,
    match: [/^\+?\d{10,15}$/, "Please enter a valid phone number"],
    // No required field to make it optional
  },
  program: {
    type: String,
    enum: ["BCSIT", "BCA", "BBA", null],
    // No required field to make it optional
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);