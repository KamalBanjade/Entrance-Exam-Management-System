import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import type { Question } from '../types';
import { FiPlus, FiEdit, FiTrash2, FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

const QuestionPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>('BCSIT');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    category: 'General Awareness',
    program: 'BCSIT',
  });

  const programs = ['BCSIT', 'BCA', 'BBA'] as const;
  const categories = [
    'Verbal Ability',
    'Quantitative Aptitude',
    'Logical Reasoning',
    'General Awareness',
  ] as const;

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true); // Start loading
      try {
        const data = await apiService.getQuestionsByProgram(selectedProgram);
        setQuestions(data);
      } catch (error: any) {
        console.error('Error fetching questions:', error);
        toast.error(error.message || 'Failed to load questions');
        setQuestions([]);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchQuestions();
  }, [selectedProgram]);

  // Sync program in form
  useEffect(() => {
    setNewQuestion((prev) => ({ ...prev, program: selectedProgram }));
  }, [selectedProgram]);

  // Handle create question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error('All 4 options are required');
      return;
    }

    if (!newQuestion.correctAnswer || !newQuestion.options.includes(newQuestion.correctAnswer)) {
      toast.error('Correct answer must be one of the options');
      return;
    }

    try {
      const createdQuestion = await apiService.createQuestionByProgram({
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        category: newQuestion.category,
        program: selectedProgram,
      });

      setQuestions(prev => [...prev, createdQuestion]);
      closeDialog();
      toast.success('✅ Question created successfully!');
    } catch (error: any) {
      console.error('Error creating question:', error);
      toast.error(error.message || 'Failed to create question');
    }
  };

  // Handle update question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestionId) return;

    if (!newQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error('All 4 options are required');
      return;
    }

    if (!newQuestion.correctAnswer || !newQuestion.options.includes(newQuestion.correctAnswer)) {
      toast.error('Correct answer must be one of the options');
      return;
    }

    try {
      const updatedQuestion = await apiService.updateQuestion(currentQuestionId, {
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        category: newQuestion.category,
      });

      setQuestions(prev => prev.map(q => (q._id === currentQuestionId ? updatedQuestion : q)));
      closeDialog();
      toast.success('✏️ Question updated successfully!');
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast.error(error.message || 'Failed to update question');
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\n"${questionText}"`)) return;

    try {
      await apiService.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      toast.success('🗑 Question deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete question');
    }
  };

  // Start editing
  const startEditing = (question: Question) => {
    setIsEditing(true);
    setCurrentQuestionId(question._id);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      category: question.category,
      program: question.program,
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      category: 'General Awareness',
      program: selectedProgram,
    });
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setCurrentQuestionId(null);
    resetForm();
  };

  // Category color mapping (with your brand)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Verbal Ability':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Quantitative Aptitude':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Logical Reasoning':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'General Awareness':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  // Correct answer badge color
  const getOptionStyle = (option: string, correctAnswer: string) => {
    if (option === correctAnswer) {
      return 'border-[#DC143C] bg-[#FEECEB] text-[#DC143C] font-medium';
    }
    return 'border-gray-200 bg-gray-50 text-gray-700';
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333]" style={{ letterSpacing: '-0.5px' }}>
              <FiEdit className="inline mr-3 text-[#DC143C]" size={28} />
              Question Bank
            </h1>
            <p className="text-[#666666] mt-1">Manage questions by program for upcoming exams.</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center px-5 py-3 bg-[#DC143C] text-white rounded-xl shadow-md hover:bg-[#c41234] transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:ring-opacity-50"
          >
            <FiPlus className="mr-2" /> Add Question
          </button>
        </div>

        {/* Program Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#333333] mb-2">Filter by Program</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] shadow-sm transition duration-200 bg-white text-[#333333]"
          >
            {programs.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <FiLoader className="animate-spin text-[#DC143C] mx-auto mb-4" size={24} />
              <p className="text-[#666666]">Fetching questions for {selectedProgram}...</p>
            </div>
          ) : questions.length > 0 ? (
            questions.map((question, index) => (
          <div
            key={question._id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              {/* Question & Options */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#FEECEB] text-[#DC143C] text-sm font-bold px-3 py-1 rounded-full border border-[#DC143C]/30">
                    #{index + 1}
                  </span>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(
                      question.category
                    )}`}
                  >
                    {question.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#333333] mb-4 leading-relaxed">
                  {question.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 font-medium ${getOptionStyle(
                        option,
                        question.correctAnswer
                      )}`}
                    >
                      <span className="font-bold text-gray-500 w-5">
                        {String.fromCharCode(97 + idx)}.
                      </span>
                      <span className="truncate">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3 min-w-max">
                <button
                  onClick={() => startEditing(question)}
                  className="flex items-center gap-2 px-4 py-2 text-[#DC143C] hover:text-[#c41234] hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <FiEdit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question._id, question.question)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
          ))
          ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <FiAlertCircle className="mx-auto text-[#666666]" size={48} />
            <h3 className="text-lg font-medium text-[#333333] mt-4">No questions found</h3>
            <p className="text-[#666666] mt-1">No questions for <strong>{selectedProgram}</strong> program.</p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="mt-4 px-5 py-2 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg transition"
            >
              Add Your First Question
            </button>
          </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isDialogOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50"
            onClick={closeDialog}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center bg-[#DC143C] text-white p-6">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Question' : 'Create New Question'}
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-white hover:text-gray-200 transition"
                  aria-label="Close modal"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={isEditing ? handleUpdateQuestion : handleCreateQuestion} className="p-6 space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Question *</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] transition text-[#333333]"
                    placeholder="Enter the question"
                    required
                  />
                </div>

                {/* Category & Correct Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">Category</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] bg-white text-[#333333]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">Correct Answer *</label>
                    <select
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] bg-white text-[#333333]"
                    >
                      <option value="">Select Correct Answer</option>
                      {newQuestion.options
                        .filter(opt => opt.trim())
                        .map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newQuestion.options.map((option, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        Option {index + 1} *
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...newQuestion.options];
                          updatedOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updatedOptions });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-5 py-3 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#DC143C] text-white rounded-lg shadow-md hover:bg-[#c41234] transition"
                  >
                    {isEditing ? 'Update Question' : 'Create Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;