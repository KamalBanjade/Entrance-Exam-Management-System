import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, BookOpen, LogOut } from 'lucide-react';


interface Question {
  _id: string;
  question: string;
  options: string[];
  category: string;
  correctAnswer: string;
}

interface ExamData {
  _id: string;
  title: string;
  duration: number;
  startedAt: string;
  questions: string[];
}

interface AnswerState {
  qId: string;
  selected: string;
}

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const startAndFetchExamData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');

        // Start exam
        const startResponse = await axios.post(
          `http://localhost:5000/api/student/start-exam/${examId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!startResponse.data.success) {
          throw new Error(startResponse.data.message || 'Failed to start exam');
        }

        // Fetch questions
        const response = await axios.get(
          `http://localhost:5000/api/student/exam/${examId}/questions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success && response.data.exam && response.data.questions) {
          setExamData(response.data.exam);
          setQuestions(response.data.questions);

          const initialAnswers = response.data.questions.map((q: Question) => ({
            qId: q._id,
            selected: '',
          }));
          setAnswers(initialAnswers);

          const startTime = new Date(response.data.exam.startedAt);
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const remaining = Math.max(0, response.data.exam.duration * 60 - elapsed);
          setTimeRemaining(remaining);
          setExamStarted(true);
        } else {
          throw new Error(response.data.message || 'Failed to load exam');
        }
      } catch (err) {
        console.error('Error:', err);
        let errorMessage = 'Failed to load exam';
        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
        navigate('/student-dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (examId) startAndFetchExamData();
  }, [examId, navigate]);

  // Auto-submit when time ends
  const submittingRef = useRef(false);
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (!submittingRef.current) {
            submittingRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeRemaining]);

  const handleAutoSubmit = async () => {
    if (submitting) return;
    toast.warning('⏰ Time is up! Submitting your exam...');
    await handleSubmitExam();
  };

  const handleAnswerSelect = (qId: string, selected: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.qId === qId ? { ...answer, selected } : answer
      )
    );
  };

  const handleSubmitExam = async () => {
    if (submitting || !examId || !examData || questions.length === 0) {
      toast.error('Exam data is incomplete');
      return;
    }

    setSubmitting(true);

    try {
      const validQuestionIds = new Set(questions.map((q) => q._id));
      const validAnswers = answers
        .filter(
          (answer) =>
            answer.selected.trim() !== '' && validQuestionIds.has(answer.qId)
        )
        .map((answer) => ({
          qId: answer.qId,
          selected: answer.selected.trim(),
        }));

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token missing');

      const response = await axios.post(
        'http://localhost:5000/api/student/submit-exam',
        { examId, answers: validAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('✅ Exam submitted successfully!');
        setTimeout(() => navigate('/student-dashboard'), 2000);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit exam. Please contact admin.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return answers.filter((a) => a.selected && a.selected.trim() !== '').length;
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setSidebarOpen(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-[#DC143C] border-t-transparent rounded-full mb-4"></div>
          <p className="text-[#666666]">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!examData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#333333] mb-2">No Questions Found</h2>
          <p className="text-[#666666] mb-4">This exam has no questions. Please contact your administrator.</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-5 py-2 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.qId === currentQuestion._id);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#333333] truncate">{examData.title}</h1>
              <p className="text-sm text-[#666666]">
                Q{currentQuestionIndex + 1} of {questions.length} •{' '}
                <span className="font-medium">Answered: {getAnsweredCount()}/{questions.length}</span>
              </p>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center px-4 py-2 rounded-lg font-mono font-semibold ${
                timeRemaining <= 300
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-[#DC143C] text-white'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeRemaining)}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Toggle question list"
            >
              <BookOpen className="w-5 h-5 text-[#333333]" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-[#333333]">Questions</h3>
                <span className="text-sm text-[#666666]">{getAnsweredCount()}/{questions.length}</span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, index) => {
                  const isAnswered = answers[index]?.selected && answers[index].selected.trim() !== '';
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`p-3 text-sm rounded-lg transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#DC143C] text-white shadow-md transform scale-105'
                          : isAnswered
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                      {isAnswered && <CheckCircle className="w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#666666]">Progress</span>
                  <span className="text-sm font-semibold text-[#333333]">
                    {Math.round((getAnsweredCount() / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#DC143C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="w-full px-4 py-3 bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Submit Exam
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-[#333333]">Questions</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5 text-[#666666]" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((_, index) => {
                    const isAnswered = answers[index]?.selected && answers[index].selected.trim() !== '';
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`p-3 text-sm rounded-lg transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#DC143C] text-white'
                            : isAnswered
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {index + 1}
                        {isAnswered && <CheckCircle className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#666666]">Progress</span>
                    <span className="text-sm font-semibold text-[#333333]">
                      {Math.round((getAnsweredCount() / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#DC143C] h-2 rounded-full"
                      style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Submit Exam
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main Question */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <span className="text-sm font-medium text-[#DC143C] bg-red-50 px-3 py-1 rounded-full">
                  {currentQuestion.category}
                </span>
                <span className="text-sm text-[#666666]">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-[#333333] mb-8 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const letter = ['A', 'B', 'C', 'D'][index];
                  return (
                    <label
                      key={index}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        currentAnswer?.selected === option
                          ? 'border-[#DC143C] bg-red-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={currentAnswer?.selected === option}
                        onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                        className="mt-1 mr-4 text-[#DC143C] focus:ring-[#DC143C]"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-[#333333]">{letter}. {option}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === questions.length - 1 && (
                    <button
                      onClick={handleSubmitExam}
                      disabled={submitting}
                      className="px-6 py-2 bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white rounded-lg transition lg:hidden"
                    >
                      {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  )}

                  <button
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center px-4 py-2 bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white rounded-lg transition"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="lg:hidden bg-white rounded-2xl shadow-sm p-4 mt-6 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#666666]">Progress</span>
                <span className="text-sm font-semibold text-[#333333]">
                  {getAnsweredCount()}/{questions.length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#DC143C] h-2 rounded-full"
                  style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                ></div>
              </div>

              {getAnsweredCount() < questions.length && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700">
                      {questions.length - getAnsweredCount()} unanswered
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-[#DC143C] border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-[#333333] mb-2">Submitting Exam</h3>
              <p className="text-[#666666]">Please wait...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;