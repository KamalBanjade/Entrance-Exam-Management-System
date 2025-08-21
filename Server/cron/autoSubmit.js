const cron = require("node-cron");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");

const startAutoSubmit = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const pendingAnswers = await Answer.find({
        submittedAt: null,
        startedAt: { $ne: null }
      }).populate("examId");

      for (const answerDoc of pendingAnswers) {
        try {
          if (!answerDoc.examId) {
            console.warn(`Missing examId for Answer ${answerDoc._id}`);
            continue;
          }

          if (!answerDoc.startedAt) continue;

          const examEndTime = new Date(
            new Date(answerDoc.startedAt).getTime() + answerDoc.examId.duration * 60000
          );

          if (now < examEndTime) continue;

          if (answerDoc.submittedAt) continue;

          const exam = await Exam.findById(answerDoc.examId._id).populate("questions");
          if (!exam) {
            console.warn(`Exam not found: ${answerDoc.examId._id}`);
            continue;
          }

          let score = 0;
          const totalQuestions = exam.questions.length;
          const validationDetails = [];

          exam.questions.forEach((q) => {
            const studentAnswer = answerDoc.answers.find(
              (a) => a.qId?.toString() === q._id.toString()
            );
            const isCorrect = studentAnswer && studentAnswer.selected === q.correctAnswer;
            if (isCorrect) score++;
            validationDetails.push({
              questionId: q._id,
              questionText: q.text || q.questionText || '',
              selectedAnswer: studentAnswer ? studentAnswer.selected : '',
              correctAnswer: q.correctAnswer,
              isCorrect: !!isCorrect
            });
          });

          const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

          answerDoc.score = score;
          answerDoc.totalQuestions = totalQuestions;
          answerDoc.percentage = percentage;
          answerDoc.result = percentage >= 50 ? "pass" : "fail";
          answerDoc.submittedAt = now;
          answerDoc.validationDetails = validationDetails;
          answerDoc.status = "submitted";

          await answerDoc.save();
          console.log(`Auto-submitted exam for student ${answerDoc.studentId}`);
        } catch (err) {
          console.error(`Error processing answer ${answerDoc._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Cron job failed:", err.message);
    }
  });
};

module.exports = startAutoSubmit;