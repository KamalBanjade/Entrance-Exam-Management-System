import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { apiService } from '../services/apiService';
import {
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiLoader,
  FiX,
  FiUser,
  FiMail,
  FiClock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import type { StudentData } from '../types/index';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStudent, setNewStudent] = useState<StudentData>({
    name: '',
    username: '',
    password: '',
    dob: '',
    email: '',
    phone: '',
    program: '',
    examTitle: '',
    examDate: '',
    examTime: '',
    examDuration: 60,
    role: 'student',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUsers();
      const users = Array.isArray(data) ? data : (data as { students?: User[] }).students || [];
      if (Array.isArray(users)) {
        setStudents(users.filter((user) => user.role === 'student'));
      } else {
        console.error('Invalid student data format:', data);
        toast.error('Failed to load students.');
        setStudents([]);
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error(error.response?.data?.message || 'Failed to load students.');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newStudent.name?.trim()) {
        toast.error('Please enter student name');
        return;
      }

      if (!newStudent.username?.trim()) {
        toast.error('Please enter username');
        return;
      }

      if (!newStudent.program) {
        toast.error('Please select a program');
        return;
      }

      if (!newStudent.password?.trim()) {
        toast.error('Please enter password');
        return;
      }

      if (newStudent.email?.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email.trim())) {
          toast.error('Please enter a valid email address');
          return;
        }
      }

      if (!['BCSIT', 'BCA', 'BBA'].includes(newStudent.program)) {
        toast.error('Please select a valid program (BCSIT, BCA, or BBA)');
        return;
      }

      if (newStudent.phone?.trim()) {
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(newStudent.phone.trim())) {
          toast.error('Please enter a valid phone number');
          return;
        }
      }

      if (newStudent.dob) {
        const dobDate = new Date(newStudent.dob);
        const today = new Date();
        const minAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

        if (dobDate > minAge) {
          toast.error('Student must be at least 16 years old');
          return;
        }

        if (dobDate > today) {
          toast.error('Date of birth cannot be in the future');
          return;
        }
      }

      const hasExamDetails = newStudent.examTitle?.trim() || newStudent.examDate || newStudent.examTime || newStudent.examDuration;

      if (hasExamDetails) {
        if (!newStudent.examTitle?.trim()) {
          toast.error('Please enter exam title');
          return;
        }

        if (!newStudent.examDate) {
          toast.error('Please select exam date');
          return;
        }

        if (!newStudent.examTime) {
          toast.error('Please select exam time');
          return;
        }

        if (!newStudent.examDuration || newStudent.examDuration <= 0) {
          toast.error('Exam duration must be greater than 0 minutes');
          return;
        }

        const examDateTime = new Date(`${newStudent.examDate} ${newStudent.examTime}`);
        const now = new Date();

        if (isNaN(examDateTime.getTime())) {
          toast.error('Invalid exam date or time');
          return;
        }

        if (examDateTime <= now) {
          toast.error('Exam date and time must be in the future');
          return;
        }

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (examDateTime > oneYearFromNow) {
          toast.error('Exam date cannot be more than one year in the future');
          return;
        }
      }

      const loadingToast = toast.loading('Sending welcome email...');

      try {
        const createdStudent = await apiService.createStudent(newStudent);

        toast.update(loadingToast, {
          render: 'Student created successfully! Welcome email sent.',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        setStudents([...students, createdStudent]);
        closeDialog();

        setTimeout(() => {
          toast.success(`${newStudent.name} can now log in and access their ${hasExamDetails ? 'scheduled exam' : 'account'}!`);
        }, 1500);

      } catch (error: any) {
        toast.dismiss(loadingToast);
        const message = error.response?.data?.message || 'Failed to create student.';

        if (message.includes('email')) {
          toast.error(message);
        } else if (message.includes('username')) {
          toast.error(message);
        } else if (message.includes('exam')) {
          toast.error(message);
        } else {
          toast.error(message);
        }
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentId) {
      toast.error('No student ID provided');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    if (!newStudent.name?.trim()) {
      toast.error('Please enter student name');
      setIsSubmitting(false);
      return;
    }
    if (!newStudent.username?.trim()) {
      toast.error('Please enter username');
      setIsSubmitting(false);
      return;
    }

    if (newStudent.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStudent.email.trim())) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }
    }

    if (newStudent.program && !['BCSIT', 'BCA', 'BBA'].includes(newStudent.program)) {
      toast.error('Please select a valid program (BCSIT, BCA, or BBA)');
      setIsSubmitting(false);
      return;
    }

    if (newStudent.phone?.trim()) {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(newStudent.phone.trim())) {
        toast.error('Please enter a valid phone number');
        setIsSubmitting(false);
        return;
      }
    }

    if (newStudent.dob) {
      const dobDate = new Date(newStudent.dob);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

      if (dobDate > minAge) {
        toast.error('Student must be at least 16 years old');
        setIsSubmitting(false);
        return;
      }

      if (dobDate > today) {
        toast.error('Date of birth cannot be in the future');
        setIsSubmitting(false);
        return;
      }
    }

    const hasExamDetails =
      newStudent.examTitle?.trim() || newStudent.examDate || newStudent.examTime || newStudent.examDuration;

    if (hasExamDetails) {
      if (!newStudent.examTitle?.trim()) {
        toast.error('Please enter exam title');
        setIsSubmitting(false);
        return;
      }
      if (!newStudent.examDate) {
        toast.error('Please select exam date');
        setIsSubmitting(false);
        return;
      }
      if (!newStudent.examTime) {
        toast.error('Please select exam time');
        setIsSubmitting(false);
        return;
      }
      if (!newStudent.examDuration || newStudent.examDuration <= 0) {
        toast.error('Exam duration must be greater than 0 minutes');
        setIsSubmitting(false);
        return;
      }

      const examDateTime = new Date(`${newStudent.examDate} ${newStudent.examTime}`);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (isNaN(examDateTime.getTime())) {
        toast.error('Invalid exam date or time');
        setIsSubmitting(false);
        return;
      }
      if (examDateTime <= now) {
        toast.error('Exam date and time must be in the future');
        setIsSubmitting(false);
        return;
      }
      if (examDateTime > oneYearFromNow) {
        toast.error('Exam date cannot be more than one year in the future');
        setIsSubmitting(false);
        return;
      }
    }

    const payload: Partial<StudentData> = {
      name: newStudent.name.trim(),
      username: newStudent.username.trim(),
      ...(newStudent.email?.trim() && { email: newStudent.email.trim() }),
      ...(newStudent.phone?.trim() && { phone: newStudent.phone.trim() }),
      ...(newStudent.dob && { dob: newStudent.dob }),
      ...(newStudent.program && { program: newStudent.program }),
      ...(newStudent.password?.trim() && { password: newStudent.password.trim() }),
      ...(hasExamDetails && {
        examTitle: newStudent.examTitle!.trim(),
        examDate: newStudent.examDate,
        examTime: newStudent.examTime,
        examDuration: newStudent.examDuration,
      }),
    };

    try {
      const updatedStudent = await apiService.updateStudent(currentStudentId, payload);
      setStudents(students.map((s) => (s._id === currentStudentId ? updatedStudent : s)));
      closeDialog();
      toast.success('✏️ Student updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update student.';
      if (error.status === 404) {
        toast.error('Student not found. Please refresh the student list.');
        await fetchStudents();
      } else if (error.status === 401) {
        toast.error('Unauthorized: Please log in as an admin.');
      } else if (error.status === 403) {
        toast.error('Access denied: Admin privileges required.');
      } else {
        toast.error(message);
      }
      console.error('Update student error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await apiService.deleteStudent(studentId);
      setStudents(students.filter((s) => s._id !== studentId));
      toast.success('🗑 Student deleted successfully.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete student.';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setNewStudent({
      name: '',
      username: '',
      password: '',
      dob: '',
      email: '',
      phone: '',
      program: '',
      examTitle: '',
      examDate: '',
      examTime: '',
      examDuration: 60,
      role: 'student',
    });
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentStudentId(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: User) => {
    setIsEditing(true);
    setCurrentStudentId(student._id);
    setNewStudent({
      name: student.name,
      username: student.username,
      password: '',
      dob: student.dob || '',
      email: student.email || '',
      phone: student.phone || '',
      program: student.program || '',
      examTitle: student.exam?.examTitle || '',
      examDate: student.exam?.examDate || '',
      examTime: student.exam?.examTime || '',
      examDuration: student.exam?.examDuration || 60,
      role: 'student',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setCurrentStudentId(null);
    resetForm();
  };

  const getProgramBadgeColor = (program: string) => {
    switch (program) {
      case 'BCSIT':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'BBA':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'BCA':
        return 'bg-red-50 text-[#DC143C] border border-[#DC143C]/30';
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
              <FiUserPlus className="mr-3 text-[#DC143C]" size={28} />
              Student Management
            </h1>
            <p className="text-[#666666] mt-1">Manage student profiles and assign exams.</p>
          </div>
          <button
            onClick={openCreateDialog}
            className="flex items-center px-5 py-3 bg-[#DC143C] text-white rounded-xl shadow-md hover:bg-[#c41234] transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:ring-opacity-50"
          >
            <FiUserPlus className="mr-2" /> Add Student
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Name & Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333] uppercase tracking-wider">
                    Program
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
                        <p className="mt-2 text-sm">Loading students...</p>
                      </div>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-[#DC143C] font-bold text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-[#333333]">{student.name}</div>
                            <div className="text-sm text-[#666666]">{student.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">
                        {student.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                        {student.email || 'No email'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.program ? (
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getProgramBadgeColor(
                              student.program
                            )}`}
                          >
                            {student.program}
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-200 text-gray-600"
                          >
                            No Program
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => openEditDialog(student)}
                          className="text-[#DC143C] hover:text-[#c41234] hover:bg-red-50 p-2 rounded-lg transition"
                          title="Edit Student"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id, student.name)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Delete Student"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#666666]">
                      <div className="flex flex-col items-center space-y-3">
                        <FiUser className="text-[#666666]" size={40} />
                        <p className="text-lg font-medium text-[#333333]">No students found</p>
                        <p className="text-sm text-[#666666]">Get started by adding your first student.</p>
                        <button
                          onClick={openCreateDialog}
                          className="mt-3 px-5 py-2 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg transition"
                        >
                          Add Student
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isDialogOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50"
            onClick={closeDialog}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center bg-[#DC143C] text-white p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Student' : 'Create New Student'}
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
              <form onSubmit={isEditing ? handleEditStudent : handleCreateStudent} className="p-6 space-y-6">
                {/* Personal Details */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-[#333333] flex items-center">
                    <FiUser className="mr-2 text-[#DC143C]" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Username *</label>
                      <input
                        type="text"
                        value={newStudent.username}
                        onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        Password {isEditing && '(Optional)'}
                      </label>
                      <input
                        type="password"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        required={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder={isEditing ? 'New password (optional)' : 'Enter password'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={newStudent.dob}
                        onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-[#333333] flex items-center">
                    <FiMail className="mr-2 text-[#DC143C]" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Email</label>
                      <input
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Phone</label>
                      <input
                        type="tel"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Program *</label>
                      <select
                        value={newStudent.program}
                        onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333] bg-white"
                      >
                        <option value="">Select Program</option>
                        <option value="BCSIT">BCSIT</option>
                        <option value="BCA">BCA</option>
                        <option value="BBA">BBA</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Exam Assignment */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-[#333333] flex items-center">
                    <FiClock className="mr-2 text-[#DC143C]" /> Exam Assignment (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Exam Title</label>
                      <input
                        type="text"
                        value={newStudent.examTitle}
                        onChange={(e) => setNewStudent({ ...newStudent, examTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="e.g., CMAT Exam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Exam Date</label>
                      <input
                        type="date"
                        value={newStudent.examDate}
                        onChange={(e) => setNewStudent({ ...newStudent, examDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Exam Time</label>
                      <input
                        type="time"
                        value={newStudent.examTime}
                        onChange={(e) => setNewStudent({ ...newStudent, examTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">Duration (min)</label>
                      <input
                        type="number"
                        value={newStudent.examDuration}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            examDuration: parseInt(e.target.value) || 60,
                          })
                        }
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-[#333333]"
                        placeholder="e.g., 60"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="px-5 py-3 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                          px-5 py-3 bg-[#DC143C] text-white rounded-lg shadow-md 
                          hover:bg-[#c41234] hover:shadow-lg
                          disabled:opacity-75 disabled:cursor-not-allowed
                          transition-all duration-200
                          flex items-center
                          focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:ring-opacity-50
                        `}
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin" size={16} />
                        <span className="ml-2 whitespace-nowrap">
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Update Student' : 'Create Student'}</span>
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