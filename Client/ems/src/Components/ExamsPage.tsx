import React, { useEffect, useState } from 'react';
import type { Exam } from '../types';
import { apiService } from '../services/apiService';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiBook, FiClock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import moment from 'moment';

interface ExamFormData {
  title: string;
  program: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    program: '',
    date: '',
    time: '',
    duration: 60,
    status: 'scheduled',
  });

  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getallExams();
        let examData: Exam[] = [];
        if (Array.isArray(response)) {
          examData = response;
        } else {
          const responseObj = response as any;
          examData = responseObj.exams || responseObj.data || [];
        }
        setExams(examData);
      } catch (error: any) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams.');
        setExams([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  const openModal = (exam?: Exam) => {
    if (exam) {
      setIsEditing(exam);
      setFormData({
        title: exam.title,
        program: exam.program,
        date: exam.date ? moment(exam.date).format('YYYY-MM-DD') : '',
        time: exam.time || '',
        duration: Number(exam.duration) || 60,
        status: exam.status as 'scheduled' | 'completed' | 'cancelled',
      });
    } else {
      setIsEditing(null);
      setFormData({
        title: '',
        program: '',
        date: '',
        time: '',
        duration: 60,
        status: 'scheduled',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'duration') {
        return {
          ...prev,
          duration: value === '' ? 0 : Number(value),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.program || !formData.date || !formData.time || formData.duration <= 0) {
      toast.error('Please fill all required fields correctly.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        program: formData.program,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        status: formData.status,
      };

      if (isEditing) {
        const updatedExam = await apiService.updateExam(isEditing._id, payload);
        setExams((prev) => prev.map((exam) => (exam._id === isEditing._id ? updatedExam : exam)));
        toast.success('Exam updated successfully!');
      } else {
        const newExam = await apiService.createExam(payload);
        setExams((prev) => [...prev, newExam]);
        await apiService.notifyStudents(newExam._id, newExam.program);
        toast.success('Exam created and students notified!');
      }

      closeModal();
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} exam.`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    setIsDeleting(examId);
    try {
      await apiService.deleteExam(examId);
      setExams((prev) => prev.filter((exam) => exam._id !== examId));
      toast.success('Exam deleted successfully.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete exam.';
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  // Program badge colors
  const getProgramBadgeColor = (program: string) => {
    switch (program) {
      case 'BCSIT':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'BBA':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'BCA':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  };

  // Status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-red-50 text-[#DC143C] border border-[#DC143C]/30';
      case 'completed':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'running':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333] flex items-center">
              <FiBook className="mr-3 text-[#DC143C]" size={28} />
              Exam Management
            </h1>
            <p className="text-[#666666] mt-1">Create, manage, and track all exams across programs.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center px-5 py-3 bg-[#DC143C] text-white rounded-xl shadow-md hover:bg-[#c41234] transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:ring-opacity-50"
          >
            <FiPlus className="mr-2" /> Create Exam
          </button>
        </div>

        {/* Exam Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Title & Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#666666]">
                      <div className="flex flex-col items-center">
                        <FiLoader className="animate-spin text-[#DC143C]" size={24} />
                        <p className="mt-2 text-sm">Loading exams...</p>
                      </div>
                    </td>
                  </tr>
                ) : exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr
                      key={exam._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg mr-3">
                            <FiBook className="text-[#DC143C]" size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#333333]">{exam.title}</div>
                            <div className="text-xs text-[#666666]">{exam.duration} min</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getProgramBadgeColor(
                            exam.program
                          )}`}
                        >
                          {exam.program}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-[#333333]">
                          <FiClock className="mr-2 text-[#666666]" size={16} />
                          <div>
                            <div>{moment(exam.date).format('MMM DD, YYYY')}</div>
                            <div className="text-[#666666]">{exam.time}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeColor(
                            exam.status
                          )}`}
                        >
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => openModal(exam)}
                          className="text-[#DC143C] hover:text-[#c41234] transition-colors duration-150"
                          title="Edit Exam"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id, exam.title)}
                          disabled={isDeleting === exam._id}
                          className="text-red-600 hover:text-red-800 transition-colors duration-150 disabled:opacity-50"
                          title="Delete Exam"
                        >
                          {isDeleting === exam._id ? (
                            <FiLoader className="animate-spin" size={18} />
                          ) : (
                            <FiTrash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#666666]">
                      <div className="flex flex-col items-center space-y-3">
                        <FiBook className="text-[#666666]" size={40} />
                        <p className="text-lg font-medium text-[#333333]">No exams created yet</p>
                        <p className="text-sm text-[#666666]">Get started by creating your first exam.</p>
                        <button
                          onClick={() => openModal()}
                          className="mt-3 px-4 py-2 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg transition"
                        >
                          Create Exam
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Exam Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center bg-[#DC143C] text-white p-6">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Exam' : 'Create New Exam'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition"
                  aria-label="Close modal"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Exam Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] transition text-[#333333]"
                      placeholder="e.g., CMAT Exam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Program *
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] bg-white text-[#333333]"
                    >
                      <option value="">Select Program</option>
                      <option value="BCSIT">BCSIT</option>
                      <option value="BCA">BCA</option>
                      <option value="BBA">BBA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] transition text-[#333333]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] transition text-[#333333]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Duration (min) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration === 0 ? '' : formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                      placeholder="e.g., 60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] bg-white text-[#333333]"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-3 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3 bg-[#DC143C] text-white rounded-lg shadow-md hover:bg-[#c41234] transition flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin mr-2" /> {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditing ? 'Update Exam' : 'Create Exam'
                    )}
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