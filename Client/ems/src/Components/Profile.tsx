import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiClock, FiShield,FiAlertCircle,FiBook} from "react-icons/fi";
import logo from "../assets/logo.png"; // Optional: Use logo in header

interface User {
  _id: string;
  role: "admin" | "student";
  name: string;
  username: string;
  dob?: string;
  email: string;
  phone: string;
  program?: "BCSIT" | "BCA" | "BBA" | null;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await apiService.getProfile();
        setUser(profileData);
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-[#DC143C] border-t-transparent rounded-full mb-4"></div>
          <p className="text-[#666666] text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-[#DC143C] hover:bg-[#c41234] text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <FiUser className="w-12 h-12 text-[#666666] mx-auto mb-4" />
          <p className="text-[#666666]">No student data found. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 object-contain rounded-lg shadow border border-[#DC143C]/20"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#333333] flex items-center justify-center gap-2">
            <FiUser className="text-[#DC143C]" /> Student Profile
          </h1>
          <p className="text-[#666666] mt-1">Your personal and academic information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#DC143C] to-[#B2102F] px-6 py-4 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiUser className="text-white" /> {user.name}
            </h2>
            <p className="text-red-100 flex items-center gap-1 text-sm">
              <FiShield className="w-4 h-4" /> {user.role === 'admin' ? 'Administrator' : 'Student'}
            </p>
          </div>

          {/* Profile Body */}
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <FiUser className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Full Name</label>
                <p className="text-[#333333] font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <FiMail className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Email Address</label>
                <p className="text-[#333333] font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <FiPhone className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Phone Number</label>
                <p className="text-[#333333] font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <FiCalendar className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Date of Birth</label>
                <p className="text-[#333333] font-medium">
                  {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <FiBriefcase className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Role</label>
                <p className="text-[#333333] font-medium capitalize">{user.role}</p>
              </div>
            </div>

            {user.role === "student" && (
              <>
                <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                  <FiBook className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
                  <div>
                    <label className="text-sm font-medium text-[#666666]">Program</label>
                    <p className="text-[#333333] font-medium">{user.program || "Not assigned"}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-3">
              <FiClock className="text-[#DC143C] mt-1 flex-shrink-0" size={20} />
              <div>
                <label className="text-sm font-medium text-[#666666]">Member Since</label>
                <p className="text-[#333333] font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-[#DC143C] hover:text-[#c41234] text-sm font-medium transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;