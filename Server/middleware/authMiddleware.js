const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authMiddleware = (role) => {
  return async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (role && decoded.role !== role) {
        return res.status(403).json({ msg: "Access denied" });
      }

      // ✅ Fetch full user data from database
      const user = await User.findById(decoded.id).select('-password').lean();
      if (!user) {
        return res.status(401).json({ msg: "User not found" });
      }

      req.user = user; // Now has _id, program, etc.
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(401).json({ msg: "Invalid token" });
    }
  };
};