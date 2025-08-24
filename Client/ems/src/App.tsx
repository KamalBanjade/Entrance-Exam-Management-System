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

      // If no token, set as unauthenticated
      if (!token) {
        console.log('No token found');
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // If token exists but no role data, still try to validate
      const detectedRole = adminData ? 'admin' : studentData ? 'student' : null;
      
      try {
        console.log('Validating token...');
        const response = await axios.get('http://localhost:5000/api/auth/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 second timeout
        });

        console.log('Token validation response:', response.data);

        if (response.data.success) {
          // If token is valid but no role detected, try to get role from response
          const roleFromResponse = response.data.role || response.data.user?.role;
          const finalRole = detectedRole || roleFromResponse;

          if (finalRole) {
            console.log('Authentication successful, role:', finalRole);
            setUserRole(finalRole);
            setIsAuthenticated(true);
            
            // Update localStorage if role was missing
            if (!detectedRole && roleFromResponse) {
              if (roleFromResponse === 'admin') {
                localStorage.setItem('admin', JSON.stringify(response.data.user || {}));
              } else if (roleFromResponse === 'student') {
                localStorage.setItem('student', JSON.stringify(response.data.user || {}));
              }
            }
          } else {
            console.warn('Token valid but no role detected anywhere');
            clearAuthData();
          }
        } else {
          console.warn('Token validation failed:', response.data);
          clearAuthData();
        }
      } catch (error: any) {
        console.error('Token validation error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
        });
        
        // Don't clear auth data for network errors - might be temporary
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || !error.response) {
          console.warn('Network error during validation, keeping existing auth state');
          // Use existing localStorage data if available
          if (detectedRole) {
            setUserRole(detectedRole);
            setIsAuthenticated(true);
          } else {
            clearAuthData();
          }
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Token expired or unauthorized, clearing auth data');
          clearAuthData();
        } else {
          // For other errors, try to preserve auth state if we have role data
          if (detectedRole) {
            console.warn('Validation error but keeping auth state due to existing role data');
            setUserRole(detectedRole);
            setIsAuthenticated(true);
          } else {
            clearAuthData();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const clearAuthData = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin');
      localStorage.removeItem('student');
      setIsAuthenticated(false);
      setUserRole(null);
    };

    validateToken();
  }, []);

  const handleSuccessfulLogin = (token: string, userData: any, role: 'admin' | 'student') => {
    console.log('Setting up authentication after successful login:', { role, userData });
    
    // Store in localStorage
    localStorage.setItem('authToken', token);
    if (role === 'admin') {
      localStorage.setItem('admin', JSON.stringify(userData));
      localStorage.removeItem('student'); // Clean up other role
    } else {
      localStorage.setItem('student', JSON.stringify(userData));
      localStorage.removeItem('admin'); // Clean up other role
    }
    
    // Update state
    setIsAuthenticated(true);
    setUserRole(role);
  };

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    userRole, 
    setUserRole, 
    isLoading,
    handleSuccessfulLogin
  };
};

const App: FC = () => {
  const { 
    isAuthenticated, 
    setIsAuthenticated, 
    userRole, 
    setUserRole, 
    isLoading,
    handleSuccessfulLogin
  } = useAuthValidation();

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
                  onSuccessfulLogin={handleSuccessfulLogin}
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