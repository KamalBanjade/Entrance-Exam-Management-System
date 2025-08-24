import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Calendar, AlertCircle, Mail, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png'; // Adjust path as needed
import { apiService } from '../services/apiService'; // Import the apiService object

interface LoginFormData {
  username: string;
  password: string;
  dateOfBirth: string;
}

interface ForgotPasswordData {
  email: string;
  username: string;
  dateOfBirth: string;
}

interface LoginPortalProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserRole: React.Dispatch<React.SetStateAction<'admin' | 'student' | null>>;
  onSuccessfulLogin: (token: string, userData: any, role: 'admin' | 'student') => void;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ 
  setIsAuthenticated, 
  setUserRole, 
  onSuccessfulLogin 
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    dateOfBirth: '',
  });
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordData>({
    email: '',
    username: '',
    dateOfBirth: '',
  });
  const [detectedRole, setDetectedRole] = useState<'student' | 'admin' | null>(null);
  const [showDateOfBirth, setShowDateOfBirth] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingCredentials, setIsCheckingCredentials] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const navigate = useNavigate();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleForgotPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotPasswordData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const checkCredentials = async () => {
    if (!formData.username || !formData.password) return;

    setIsCheckingCredentials(true);
    setError('');

    try {
      console.log('🔍 Checking credentials for:', formData.username);

      // Try admin login
      try {
        const adminResponse = await apiService.adminLogin(formData.username, formData.password);
        if (adminResponse.success) {
          console.log('✅ Admin credentials detected');
          setDetectedRole('admin');
          setShowDateOfBirth(false);
          return;
        }
      } catch (err) {
        console.log('❌ Not admin');
      }

      // Try student credentials
      try {
        const studentResponse = await apiService.checkStudentCredentials(formData.username, formData.password);
        if (studentResponse.success) {
          console.log('✅ Student credentials detected');
          setDetectedRole('student');
          setShowDateOfBirth(true);
          return;
        }
      } catch (err) {
        console.log('❌ Not student');
      }

      setError('Invalid username or password');
      setDetectedRole(null);
      setShowDateOfBirth(false);
    } catch (err) {
      setError('Invalid username or password');
      setDetectedRole(null);
      setShowDateOfBirth(false);
    } finally {
      setIsCheckingCredentials(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detectedRole) {
      await checkCredentials();
      return;
    }

    if (detectedRole === 'student' && !formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response;
      if (detectedRole === 'student') {
        response = await apiService.studentLogin(formData.username, formData.password, formData.dateOfBirth);
      } else {
        response = await apiService.adminLogin(formData.username, formData.password);
      }

     if (response.success) {
        // Use the new authentication handler
        onSuccessfulLogin(response.token || '', response.user, detectedRole);
        
        toast.success(`Welcome back, ${detectedRole}!`);

        const redirectPath = detectedRole === 'student' ? '/student-dashboard' : '/admin-dashboard';
        navigate(redirectPath);
      }else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!forgotPasswordData.email || !forgotPasswordData.username || !forgotPasswordData.dateOfBirth) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.forgotPassword(
        forgotPasswordData.email,
        forgotPasswordData.username,
        forgotPasswordData.dateOfBirth
      );

      if (response.success) {
        setSuccess('Password recovery instructions sent to your email!');
        toast.success('Password recovery instructions sent to your email!');
        setForgotPasswordData({ email: '', username: '', dateOfBirth: '' });
      } else {
        setError(response.message || 'Password recovery failed');
        toast.error(response.message || 'Password recovery failed');
      }
    } catch (err: any) {
      const message = err.message || 'Network error. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError('');
    setSuccess('');
    setFormData({ username: '', password: '', dateOfBirth: '' });
    setForgotPasswordData({ email: '', username: '', dateOfBirth: '' });
    setDetectedRole(null);
    setShowDateOfBirth(false);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', dateOfBirth: '' });
    setDetectedRole(null);
    setShowDateOfBirth(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#DC143C] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#DC143C] rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-xl shadow-lg border border-[#DC143C]/20"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide leading-tight">
            Crimson College
          </h2>
          <div className="flex items-center justify-center mt-3 mb-2">
            <span className="text-sm text-gray-600 font-medium italic mr-2">Of Technology</span>
            <div className="w-12 h-0.5 bg-red-500 ml-2 mt-3"></div>
          </div>
          <h1 className="text-xl font-bold text-[#DC143C] tracking-wider">
            {showForgotPassword ? 'Reset your password' : 'Exam Portal'}
          </h1>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {detectedRole && (
                <div
                  className={`flex items-center justify-center p-3 rounded-lg border-2 ${
                    detectedRole === 'admin'
                      ? 'bg-red-50 border-[#DC143C]/30 text-[#DC143C]'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                  } text-sm font-medium`}
                >
                  {detectedRole === 'admin' ? (
                    <>
                      🔐 <span className="ml-2">Administrator Account</span>
                    </>
                  ) : (
                    <>
                      📘 <span className="ml-2">Student Account</span>
                    </>
                  )}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleLoginChange}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                  required
                  disabled={isLoading || isCheckingCredentials}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                  required
                  disabled={isLoading || isCheckingCredentials}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#DC143C]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {showDateOfBirth && (
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleLoginChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isCheckingCredentials}
                className="w-full bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading || isCheckingCredentials ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : detectedRole ? (
                  <>
                    <span>Sign In as {detectedRole}</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <Sparkles size={18} />
                  </>
                )}
              </button>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                {detectedRole && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-[#666666] hover:text-[#333333] transition"
                  >
                    Not you? Try different credentials
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-[#DC143C] hover:text-[#c41234] text-sm font-medium transition cursor-pointer"
                >
                  <Shield size={16} className="inline mr-1" /> Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-5">
                <div className="mx-auto w-12 h-12 bg-[#DC143C] rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#333333]">Password Recovery</h2>
                <p className="text-[#666666] text-sm mt-2">Enter your details.</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="email"
                  name="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="text"
                  name="username"
                  value={forgotPasswordData.username}
                  onChange={handleForgotPasswordChange}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={forgotPasswordData.dateOfBirth}
                  onChange={handleForgotPasswordChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm bg-white transition"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} className="inline mr-1" /> {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                  ✅ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#DC143C] hover:bg-[#c41234] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Mail size={18} /> Send Recovery Email
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleForgotPassword}
                className="w-full text-[#DC143C] hover:text-[#c41234] text-sm font-medium transition"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>

        <p className="text-[#666666] text-xs text-center mt-6">
          Secure access • Privacy protected • Contact your administrator
        </p>
      </div>
    </div>
  );
};

export default LoginPortal;