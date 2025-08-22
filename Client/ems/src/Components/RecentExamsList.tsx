import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Exam } from '../types';
import { apiService } from '../services/apiService';
import { FiCalendar, FiClock, FiBookOpen, FiCheckCircle } from 'react-icons/fi';

export const RecentExamsList: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await apiService.getallExams();
        const sorted = Array.isArray(data)
          ? data
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
          : [];
        setExams(sorted);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      case 'running':
        return 'bg-indigo-50 text-indigo-800 border border-indigo-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-3"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-[#333333] flex items-center gap-2">
          <FiBookOpen className="text-[#DC143C]" /> Recent Exams
        </h2>
        <span className="text-sm font-medium text-[#DC143C] bg-red-50 px-2.5 py-1 rounded-full">
          {exams.length}
        </span>
      </div>

      <div className="space-y-3">
        {exams.length > 0 ? (
          exams.map((exam, index) => (
            <Link
              key={exam._id || index}
              to="/admin-dashboard/exams"
              className="block p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg transition-all hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#333333] truncate">{exam.title}</h3>
                  <div className="flex items-center text-xs text-[#666666] mt-1 space-x-3">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={12} /> {new Date(exam.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} /> {exam.time}
                    </span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {exam.program}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(
                    exam.status
                  )}`}
                >
                  {exam.status === 'completed' && <FiCheckCircle size={12} />}
                  {exam.status === 'running' ? 'Live' : exam.status}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-[#666666]">
            <FiBookOpen size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No exams scheduled</p>
          </div>
        )}
      </div>

      <Link
        to="/admin-dashboard/exams"
        className="block text-center mt-20 text-[#DC143C] hover:text-[#c41234] font-medium text-sm transition"
      >
        <FiBookOpen className="inline-block mr-1" /> View all exams
      </Link>
    </div>
  );
};