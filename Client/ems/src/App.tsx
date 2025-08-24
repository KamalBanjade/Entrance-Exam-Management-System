import { useState, useEffect, type FC, Component } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {DashboardLayout} from './Components/DashboardLayout';
import LoginPortal from './Components/LoginPortal';
import { DashboardPage } from './Components/DashboardPage';
import { StudentsPage } from './Components/StudentsPage';
import { ExamsPage } from './Components/ExamsPage';
import { ResultsPage } from './Components/ResultsPage';
import ResetPassword from './Components/ResetPassword';
import QuestionPage from './Components/QuestionsPage';
import StudentDashboard from './Components/StudentDashboard';
import ExamInterface from './Components/ExamInterface';
import Profile from './Components/Profile';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h1>
            <p className="text-gray-600 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LocationDebugger: FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Route changed:', {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    }
  }, [location]);

  return null;
};

const LoadingScreen: FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-sm">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-200 mx-auto h-16 w-16"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700">Initializing Application...</p>
      <p className="mt-2 text-sm text-gray-500">Please wait while we set up your dashboard</p>
    </div>
  </div>
);

const useAuthValidation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const adminData = localStorage.getItem('admin');
      const studentData = localStorage.getItem('student');

      if (!token) {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const detectedRole = adminData ? 'admin' : studentData ? 'student' : null;
          if (!detectedRole) {
            console.warn('Token valid but no role detected, clearing data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('admin');
            localStorage.removeItem('student');
            setIsAuthenticated(false);
            setUserRole(null);
          } else {
            setUserRole(detectedRole);
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('admin');
          localStorage.removeItem('student');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error: any) {
        console.error('Token validation error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
        localStorage.removeItem('student');
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  return { isAuthenticated, setIsAuthenticated, userRole, setUserRole, isLoading };
};

const App: FC = () => {
  const { isAuthenticated, setIsAuthenticated, userRole, setUserRole, isLoading } = useAuthValidation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <LocationDebugger />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-50"
        />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && userRole ? (
                <Navigate 
                  to={userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard'} 
                  replace 
                />
              ) : (
                <LoginPortal 
                  setIsAuthenticated={setIsAuthenticated} 
                  setUserRole={setUserRole} 
                />
              )
            }
          />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin-dashboard"
            element={
              isAuthenticated && userRole === 'admin' ? (
                <DashboardLayout />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="questions" element={<QuestionPage />} />

            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Route>

          <Route
            path="/student-dashboard"
            element={
              isAuthenticated && userRole === 'student' ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
            >
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/exam/:examId"
            element={
              isAuthenticated && userRole === 'student' ? (
                <ExamInterface />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;