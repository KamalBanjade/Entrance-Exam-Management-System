const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const examScheduler = require("./schedulers/examTimerScheduler");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeTimers: examScheduler.getActiveTimers().length
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const initializeApp = async () => {
  try {
    await connectDB();
    await examScheduler.initializeExistingExams();
    require("./cron/autoSubmit")();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

const shutdown = () => {
  examScheduler.cleanup();
  mongoose.connection.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  examScheduler.cleanup();
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});