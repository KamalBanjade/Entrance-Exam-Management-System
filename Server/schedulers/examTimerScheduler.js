const moment = require('moment');
const Exam = require('../models/Exam');

class ExamTimerScheduler {
  constructor() {
    this.activeTimers = new Map();
  }

  scheduleExam(exam) {
    try {
      let examDateTime;
      if (exam.date instanceof Date) {
        const dateStr = moment(exam.date).format('YYYY-MM-DD');
        examDateTime = moment(`${dateStr} ${exam.time}`, 'YYYY-MM-DD HH:mm');
      } else {
        examDateTime = moment(`${exam.date} ${exam.time}`, 'YYYY-MM-DD HH:mm');
      }

      if (!examDateTime.isValid()) {
        return;
      }

      const examStartTime = examDateTime;
      const examEndTime = examDateTime.clone().add(exam.duration, 'minutes');
      const now = moment();
      const startDelay = examStartTime.diff(now);
      const endDelay = examEndTime.diff(now);

      if (endDelay <= 0) {
        this.completeExam(exam._id);
        return;
      } else if (startDelay <= 0 && endDelay > 0) {
        this.startExam(exam._id);
        this.scheduleCompletion(exam, endDelay);
        return;
      } else if (startDelay > 0) {
        this.scheduleStart(exam, startDelay);
        this.scheduleCompletion(exam, endDelay);
      }
    } catch (error) {}
  }

  scheduleStart(exam, delay) {
    const startTimerId = setTimeout(async () => {
      await this.startExam(exam._id);
    }, delay);

    const examIdStr = exam._id.toString();
    const existingTimer = this.activeTimers.get(examIdStr) || {};
    this.activeTimers.set(examIdStr, {
      ...existingTimer,
      startTimerId,
      examTitle: exam.title,
      examId: exam._id,
    });
  }

  scheduleCompletion(exam, delay) {
    const endTimerId = setTimeout(async () => {
      await this.completeExam(exam._id);
      this.activeTimers.delete(exam._id.toString());
    }, delay);

    const examIdStr = exam._id.toString();
    const existingTimer = this.activeTimers.get(examIdStr) || {};
    this.activeTimers.set(examIdStr, {
      ...existingTimer,
      endTimerId,
      examTitle: exam.title,
      examId: exam._id,
    });
  }

  async startExam(examId) {
    try {
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        {
          status: 'running',
          startedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {}
  }

  async completeExam(examId) {
    try {
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        {
          status: 'completed',
          completedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {}
  }

  cancelExamTimers(examId) {
    const examIdStr = examId.toString();
    const timer = this.activeTimers.get(examIdStr);

    if (timer) {
      if (timer.startTimerId) {
        clearTimeout(timer.startTimerId);
      }
      if (timer.endTimerId) {
        clearTimeout(timer.endTimerId);
      }
      this.activeTimers.delete(examIdStr);
      return true;
    }
    return false;
  }

  async initializeExistingExams() {
    try {
      const activeExams = await Exam.find({ 
        status: { $in: ['scheduled', 'running'] } 
      });
      for (const exam of activeExams) {
        this.scheduleExam(exam);
      }
    } catch (error) {}
  }

  getActiveTimers() {
    const timers = [];
    for (const [examId, timer] of this.activeTimers) {
      timers.push({
        examId,
        examTitle: timer.examTitle,
        hasStartTimer: !!timer.startTimerId,
        hasEndTimer: !!timer.endTimerId,
      });
    }
    return timers;
  }

  cleanup() {
    for (const [examId, timer] of this.activeTimers) {
      if (timer.startTimerId) {
        clearTimeout(timer.startTimerId);
      }
      if (timer.endTimerId) {
        clearTimeout(timer.endTimerId);
      }
    }
    this.activeTimers.clear();
  }
}

module.exports = new ExamTimerScheduler();