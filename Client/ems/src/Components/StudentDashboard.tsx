// StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import SidePanel from './SidePanel';
import moment from 'moment-timezone';
import type { Exam, User } from '../types/index';
import { apiService } from '../services/apiService';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = async () => {
    try {
      const profileData = await apiService.getProfile();
      setUser(profileData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    }
  };

const fetchExams = async () => {
  try {
    const data = await apiService.getExams();
    // 🔥 FIX: Use Asia/Kathmandu timezone consistently
    const now = moment.tz('Asia/Kathmandu');
    
    const processedExams = data.map((exam: Exam) => {
      // 🔥 FIX: Also use Asia/Kathmandu timezone for exam date/time parsing
      const examDateTime = moment.tz(`${exam.date} ${exam.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kathmandu');
      const examEndTime = examDateTime.clone().add(parseInt(String(exam.duration)), 'minutes');
      
      // 5 minute buffer
      const examStartWithBuffer = examDateTime.clone().subtract(5, 'minutes');
      const examEndWithBuffer = examEndTime.clone().add(5, 'minutes');
      
      let displayStatus: 'upcoming' | 'available' | 'completed' | 'expired';
      let canStart = false;

      console.log(`Exam "${exam.title}" ASIA/KATHMANDU TIME:`, {
        currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
        examStart: examDateTime.format('YYYY-MM-DD HH:mm:ss'),
        examEnd: examEndTime.format('YYYY-MM-DD HH:mm:ss'),
        startBuffer: examStartWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
        endBuffer: examEndWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
        canStart: now.isBetween(examStartWithBuffer, examEndWithBuffer),
        timezone: 'Asia/Kathmandu'
      });

      if (!examDateTime.isValid()) {
        displayStatus = 'upcoming';
        canStart = false;
      } else if (exam.status === 'completed') {
        displayStatus = 'completed';
        canStart = false;
      } else if (exam.status === 'cancelled') {
        displayStatus = 'expired';
        canStart = false;
      } else if (now.isBefore(examStartWithBuffer)) {
        displayStatus = 'upcoming';
        canStart = false;
      } else if (now.isAfter(examEndWithBuffer)) {
        displayStatus = 'expired';
        canStart = false;
      } else {
        displayStatus = 'available';
        canStart = true;
      }

      return { ...exam, displayStatus, canStart };
    });
    
    setExams(processedExams);
  } catch (error: any) {
    toast.error(error.message || 'Failed to load exams');
    if (error.response?.status === 401) navigate('/login');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const fetchData = async () => {
    await fetchProfile();
    await fetchExams();
  };
  fetchData();
  const interval = setInterval(fetchExams, 30000);
  return () => clearInterval(interval);
}, [navigate]);

const handleStartExam = async (exam: Exam) => {
  // 🔥 FIX: Use Asia/Kathmandu timezone consistently
  const now = moment.tz('Asia/Kathmandu'); 
  const examDateTime = moment.tz(`${exam.date} ${exam.time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kathmandu');
  const examEndTime = examDateTime.clone().add(parseInt(String(exam.duration)), 'minutes');
  const examStartWithBuffer = examDateTime.clone().subtract(5, 'minutes');
  const examEndWithBuffer = examEndTime.clone().add(5, 'minutes');

  console.log('🚀 Starting exam validation (ASIA/KATHMANDU TIME):', {
    examTitle: exam.title,
    examId: exam._id,
    canStart: exam.canStart,
    displayStatus: exam.displayStatus,
    currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
    examStart: examDateTime.format('YYYY-MM-DD HH:mm:ss'),
    examEnd: examEndTime.format('YYYY-MM-DD HH:mm:ss'),
    startBuffer: examStartWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
    endBuffer: examEndWithBuffer.format('YYYY-MM-DD HH:mm:ss'),
    examWindow: `${examStartWithBuffer.format('HH:mm')} - ${examEndWithBuffer.format('HH:mm')}`,
    isInWindow: now.isBetween(examStartWithBuffer, examEndWithBuffer),
    timezone: 'Asia/Kathmandu'
  });

  // 🔥 ADDITIONAL: Real-time validation to double-check
  const realTimeCanStart = now.isBetween(examStartWithBuffer, examEndWithBuffer) && 
                          exam.displayStatus !== 'completed' && 
                          exam.displayStatus !== 'expired';

  console.log('🔄 Real-time validation:', {
    storedCanStart: exam.canStart,
    realTimeCanStart: realTimeCanStart,
    match: exam.canStart === realTimeCanStart
  });

  if (!exam.canStart || !realTimeCanStart) {
    console.warn('❌ Exam cannot be started:', {
      reason: exam.displayStatus,
      currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
      examStartTime: examDateTime.format('YYYY-MM-DD HH:mm:ss'),
      storedCanStart: exam.canStart,
      realTimeCanStart: realTimeCanStart
    });
    
    let message = 'Exam not available yet.';
    if (exam.displayStatus === 'upcoming' || now.isBefore(examStartWithBuffer)) {
      message = `Exam starts at ${examDateTime.format('MMM DD, YYYY h:mm A')}. Please wait.`;
    } else if (exam.displayStatus === 'expired' || now.isAfter(examEndWithBuffer)) {
      message = `Exam has expired. It ended at ${examEndTime.format('MMM DD, YYYY h:mm A')}.`;
    } else if (exam.displayStatus === 'completed') {
      message = 'Exam has already been completed.';
    }
    
    toast.error(message);
    return;
  }

  try {
    console.log('📤 Sending start exam request...');
    const response = await apiService.startExam(exam._id);
    
    console.log('📥 Start exam response:', response);
    
    if (response.success) {
      toast.success('Exam started! Good luck!');
      navigate(`/exam/${exam._id}`);
    } else {
      console.error('❌ Start exam failed:', response);
      toast.error(response.message || 'Failed to start exam');
    }
  } catch (error: any) {
    console.error('❌ Start exam error:', error);
    
    // 🔥 Better error handling with more specific messages
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Exam is not available at this time';
      console.error('403 Error details:', {
        message: errorMessage,
        debugInfo: error.response?.data?.debug,
        status: error.response?.status,
        frontendTime: now.format('YYYY-MM-DD HH:mm:ss'),
        timezone: 'Asia/Kathmandu'
      });
      toast.error(errorMessage);
    } else if (error.response?.status === 401) {
      toast.error('Authentication failed. Please login again.');
      navigate('/login');
    } else {
      toast.error(error.message || 'Failed to start exam. Please try again.');
    }
  }
};
  const formatDate = (dateString: string) => moment(dateString).format('MMM DD, YYYY');
  const formatTime = (timeString: string) => moment(timeString, 'HH:mm').format('h:mm A');
  const calculateDueTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return 'N/A';
    return moment(startTime, 'HH:mm').add(parseInt(duration), 'minutes').format('h:mm A');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const isProfileRoute = location.pathname === '/student-dashboard/profile';

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      {/* Fixed Sidebar */}
      <SidePanel
        userRole="student"
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className={`
          flex-1 flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <header className="bg-white shadow-sm border-b border-red-400 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 m-1">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center mb-2">
                <h1 className="text-xl font-bold text-[#333333]">
                  <span className="text-[#DC143C]">
                    {isProfileRoute ? 'Profile' : "Student's"}
                  </span>{' '}
                  <span className="text-green-600">{isProfileRoute ? '' : 'Dashboard'}</span>
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#DC143C] flex items-center justify-center text-white font-medium shadow-md">
                  {user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <span className="text-sm font-medium text-[#333333] hidden md:inline">
                  {user?.name || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-auto mx-auto">
            {isProfileRoute ? (
              <Outlet />
            ) : (
              <>
                {/* Welcome */}
                <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h1 className="text-3xl font-bold mb-2">
                    <span className="text-gray-800">Welcome,</span>{' '}
                    <span className="bg-gradient-to-r from-[#DC143C] to-[#B2102F] bg-clip-text text-transparent">
                      {user?.name || 'Student'}
                    </span>
                    !
                  </h1>
                  <p className="text-lg text-[#201f1f] font-medium">
                    You are currently enrolled in the{' '}
                    <span className="text-[#DC143C] font-semibold">{user?.program || 'your program'} </span>program.
                  </p>
                </div>


                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-red-50 text-[#DC143C] mr-4">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-[#666666]">Total Exams</p>
                        <p className="text-2xl font-bold text-[#333333]">{exams.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-[#666666]">Upcoming</p>
                        <p className="text-2xl font-bold text-[#333333]">
                          {exams.filter((e) => e.displayStatus === 'upcoming').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-[#666666]">Completed</p>
                        <p className="text-2xl font-bold text-[#333333]">
                          {exams.filter((e) => e.displayStatus === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exams Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
                      <Calendar className="text-[#DC143C]" size={20} />
                      My Exams
                    </h2>
                  </div>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin w-8 h-8 border-2 border-[#DC143C] border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-4 text-[#666666]">Loading exams...</p>
                    </div>
                  ) : exams.length === 0 ? (
                    <div className="text-center py-12 text-[#666666]">
                      <p className="text-lg">No exams assigned yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Exam</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Program</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Start</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Due</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {exams.map((exam) => (
                            <tr key={exam._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-[#333333]">{exam.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{exam.program}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{formatDate(exam.date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{formatTime(exam.time)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{calculateDueTime(exam.time, String(exam.duration))}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(exam.displayStatus)}`}>
                                  {exam.displayStatus.charAt(0).toUpperCase() + exam.displayStatus.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {exam.displayStatus === 'completed' ? (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">Completed</span>
                                ) : exam.displayStatus === 'expired' ? (
                                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs">Expired</span>
                                ) : exam.canStart ? (
                                  <button
                                    onClick={() => handleStartExam(exam)}
                                    className="px-3 py-1 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg text-xs font-medium transition"
                                  >
                                    Start Exam
                                  </button>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">Not yet</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="mt-8 bg-gradient-to-r from-[#DC143C] to-[#B2102F] rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 text-white">
                    <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <div className="bg-white/20 rounded-full p-1.5">
                        <BookOpen size={18} />
                      </div>
                      Exam Instructions
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Click 'Start Exam' only during the scheduled time window",
                        "Once started, the timer begins and cannot be paused",
                        "The exam will auto-submit when time expires",
                        "Ensure a stable internet connection throughout",
                        "Exams cannot be started after their time window expires",
                        "Exams will start exactly on the scheduled time",
                        "Contact admin if you face any issues"
                      ].map((instruction, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                          <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm leading-relaxed text-white/95">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;