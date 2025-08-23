import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, BookOpen, LogOut, Save } from 'lucide-react';
import { apiService } from '../services/apiService';
import CustomModal from '../Components/CustomModal';

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
  startedAt: Date;
  questions: string[];
  program: string;
}

interface AnswerState {
  qId: string;
  selected: string;
}

interface SavedExamState {
  examId: string;
  answers: AnswerState[];
  currentQuestionIndex: number;
  startedAt: string;
  lastSaved: string;
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [savedStateToResume, setSavedStateToResume] = useState<SavedExamState | null>(null);

  const getStorageKey = () => `exam_${examId}_answers`;

  const saveAnswersToStorage = (answersToSave: AnswerState[], questionIndex = currentQuestionIndex) => {
    if (!examId || !examData) return;
    try {
      const savedState: SavedExamState = {
        examId,
        answers: answersToSave,
        currentQuestionIndex: questionIndex,
        startedAt: examData.startedAt.toISOString(),
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(savedState));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const loadAnswersFromStorage = (): SavedExamState | null => {
    if (!examId) return null;
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsed: SavedExamState = JSON.parse(saved);
        if (parsed.examId === examId) return parsed;
      }
    } catch (error) {
      console.error('Failed to load localStorage:', error);
    }
    return null;
  };

  const clearSavedAnswers = () => {
    if (!examId) return;
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performAutoSave = (answersToSave: AnswerState[]) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    setAutoSaving(true);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveAnswersToStorage(answersToSave);
      setAutoSaving(false);
    }, 500);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setSidebarOpen(false);
    }
  };

  const handleAnswerSelect = (qId: string, selected: string) => {
    setAnswers((prev) =>
      prev.map((ans) => (ans.qId === qId ? { ...ans, selected } : ans))
    );
  };

  useEffect(() => {
    const initExam = async () => {
      if (!examId) {
        toast.error('Invalid exam ID');
        navigate('/student-dashboard');
        return;
      }

      try {
        const savedState = loadAnswersFromStorage();
        let shouldShowResume = false;

        if (savedState && savedState.answers.some((a) => a.selected.trim() !== '')) {
          shouldShowResume = true;
        }

        const startRes = await apiService.startExam(examId);
        if (!startRes.success) throw new Error(startRes.message);

        const res = await apiService.getExamQuestions(examId);
        if (!res.success || !res.exam || !res.questions) throw new Error(res.message);

        const exam: ExamData = {
          _id: res.exam._id,
          title: res.exam.title,
          duration: Number(res.exam.duration),
          program: res.exam.program,
          startedAt: res.exam.startedAt ? new Date(res.exam.startedAt) : new Date(),
          questions: res.exam.questions,
        };

        const startTime = new Date(exam.startedAt);
        const now = new Date();
        const elapsedSec = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const remainingSec = Math.max(0, exam.duration * 60 - elapsedSec);

        setExamData(exam);
        setQuestions(res.questions);

        if (shouldShowResume) {
          setSavedStateToResume(savedState);
          setShowResumeModal(true);
        } else {
          const fresh = res.questions.map((q) => ({ qId: q._id, selected: '' }));
          setAnswers(fresh);
        }

        setTimeRemaining(remainingSec);
        setExamStarted(true);
      } catch (err: any) {
        console.error('Load error:', err);
        const message = err.message || 'Failed to load exam';
        toast.error(message);
        navigate('/student-dashboard');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, navigate]);

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (!examId) {
        throw new Error('Exam ID is missing');
      }

      const validIds = new Set(questions.map((q) => q._id));
      const validAnswers = answers
        .filter((a) => a.selected.trim() !== '' && validIds.has(a.qId))
        .map((a) => ({ qId: a.qId, selected: a.selected.trim() }));

      const res = await apiService.submitExam({ examId, answers: validAnswers });

      if (res.success) {
        clearSavedAnswers();
        toast.success('✅ Exam submitted successfully!');
        // Dispatch custom event to notify ExamsPage
        window.dispatchEvent(new Event('examSubmitted'));
        setTimeout(() => navigate('/student-dashboard'), 1500);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err: any) {
      const message = err.alreadySubmitted
        ? 'Exam already submitted'
        : err.message || 'Submission failed';
      toast.error(message);
      if (err.alreadySubmitted) {
        window.dispatchEvent(new Event('examSubmitted'));
        setTimeout(() => navigate('/student-dashboard'), 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  useEffect(() => {
    if (examStarted && timeRemaining <= 0 && !submitting && !showTimeUpModal) {
      setShowTimeUpModal(true);
      toast.warning('⏰ Time is up! Submitting your exam...');
      handleSubmitExam();
    }
  }, [examStarted, timeRemaining, submitting, showTimeUpModal]);

  useEffect(() => {
    if (answers.length > 0 && examStarted) {
      performAutoSave(answers);
    }
  }, [answers, examStarted]);

  useEffect(() => {
    if (examStarted && answers.length > 0) {
      saveAnswersToStorage(answers, currentQuestionIndex);
    }
  }, [currentQuestionIndex, examStarted]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, []);

  const handleResumeConfirm = () => {
    if (!savedStateToResume || !questions.length) return;

    const validIds = new Set(questions.map((q) => q._id));
    const validAnswers = savedStateToResume.answers.filter((a) => validIds.has(a.qId));

    const restored = questions.map((q) => {
      const saved = validAnswers.find((a) => a.qId === q._id);
      return { qId: q._id, selected: saved?.selected || '' };
    });

    setAnswers(restored);
    setCurrentQuestionIndex(Math.min(savedStateToResume.currentQuestionIndex, questions.length - 1));
    toast.success('✅ Progress restored');
    setShowResumeModal(false);
  };

  const handleFreshStart = () => {
    const fresh = questions.map((q) => ({ qId: q._id, selected: '' }));
    setAnswers(fresh);
    setCurrentQuestionIndex(0);
    clearSavedAnswers();
    toast.info('Started fresh');
    setShowResumeModal(false);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return answers.filter((a) => a.selected.trim() !== '').length;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.qId === currentQuestion?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-[#DC143C] border-t-transparent rounded-full mb-4"></div>
          <p className="text-[#666666]">{examId ? 'Loading exam...' : 'Invalid exam ID'}</p>
        </div>
      </div>
    );
  }

  if (!examData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#333333] mb-2">Exam Not Available</h2>
          <p className="text-[#666666] mb-4">Please contact your administrator.</p>
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#333333] truncate">{examData.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <span>
                  Q{currentQuestionIndex + 1} of {questions.length} •{' '}
                  <span className="font-medium">Answered: {getAnsweredCount()}/{questions.length}</span>
                </span>
                {lastSaved && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {autoSaving && (
                  <span className="flex items-center text-[#DC143C]">
                    <div className="w-3 h-3 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin mr-1"></div>
                    Saving...
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  saveAnswersToStorage(answers);
                  toast.success('💾 Saved manually');
                }}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title="Manual save"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>

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

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                aria-label="Toggle questions"
              >
                <BookOpen className="w-5 h-5 text-[#333333]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-80">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-[#333333]">Questions</h3>
                <span className="text-sm text-[#666666]">{getAnsweredCount()}/{questions.length}</span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, idx) => {
                  const answered = answers[idx]?.selected.trim() !== '';
                  const current = idx === currentQuestionIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToQuestion(idx)}
                      className={`p-3 text-sm rounded-lg transition flex items-center justify-center ${
                        current
                          ? 'bg-[#DC143C] text-white scale-105'
                          : answered
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {idx + 1}
                      {answered && <CheckCircle className="w-3 h-3 ml-1" />}
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
                    className="bg-[#DC143C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting || !examId}
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

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-xl"
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
                  {questions.map((_, idx) => {
                    const answered = answers[idx]?.selected.trim() !== '';
                    const current = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => goToQuestion(idx)}
                        className={`p-3 text-sm rounded-lg ${
                          current
                            ? 'bg-[#DC143C] text-white'
                            : answered
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {idx + 1}
                        {answered && <CheckCircle className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting || !examId}
                  className="w-full px-4 py-3 bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white rounded-lg transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              </div>
            </div>
          )}

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

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  return (
                    <label
                      key={idx}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                        currentAnswer?.selected === opt
                          ? 'border-[#DC143C] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion._id}`}
                        value={opt}
                        checked={currentAnswer?.selected === opt}
                        onChange={() => handleAnswerSelect(currentQuestion._id, opt)}
                        className="mt-1 mr-4 text-[#DC143C] focus:ring-[#DC143C]"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-[#333333]">
                          {letter}. {opt}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentQuestionIndex === questions.length - 1 && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting || !examId}
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
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={showResumeModal}
        onClose={handleFreshStart}
        title="Resume Previous Session?"
        message={
          <div>
            <p>You have saved answers from earlier:</p>
            {savedStateToResume?.lastSaved && (
              <p className="font-medium mt-2">
                Last saved: {new Date(savedStateToResume.lastSaved).toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Would you like to continue from where you left off?
            </p>
          </div>
        }
        onConfirm={handleResumeConfirm}
        confirmText="Resume"
        cancelText="Start Fresh"
      />

      <CustomModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam?"
        message="Are you sure you want to submit your exam? You won't be able to make changes after submission."
        onConfirm={handleSubmitExam}
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={submitting}
      />

      <CustomModal
        isOpen={showTimeUpModal}
        onClose={() => {}}
        title="⏰ Time's Up!"
        message="Your exam time has ended. We'll now submit your answers automatically."
        onConfirm={handleSubmitExam}
        confirmText="Submit Now"
        cancelText=""
        isLoading={submitting}
      />
    </div>
  );
};

export default ExamInterface;