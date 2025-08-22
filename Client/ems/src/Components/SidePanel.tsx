// SidePanel.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Home,
  // Clock,
  LogOut,
  // Bookmark,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  FileText,
  BarChart2,
} from 'lucide-react';
import logo from '../assets/logo.png';

interface SidePanelProps {
  userRole: 'admin' | 'student';
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  className?: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ userRole, collapsed, setCollapsed, className = '' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    toast.success('Logged out successfully');
    window.location.reload();
  };

  const adminNavItems: NavItem[] = [
    { icon: <Home className="w-6 h-6" />, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: <Users className="w-6 h-6" />, label: 'Students', path: '/admin-dashboard/students' },
    { icon: <BookOpen className="w-6 h-6" />, label: 'Exams', path: '/admin-dashboard/exams' },
    { icon: <FileText className="w-6 h-6" />, label: 'Questions', path: '/admin-dashboard/questions' },
    { icon: <BarChart2 className="w-6 h-6" />, label: 'Results', path: '/admin-dashboard/results' },
  ];

  const studentNavItems: NavItem[] = [
    { icon: <Home className="w-6 h-6" />, label: 'Dashboard', path: '/student-dashboard' },
    // { icon: <Bookmark className="w-6 h-6" />, label: 'Schedule', path: '/student-dashboard/schedule' },
    // { icon: <Clock className="w-6 h-6" />, label: 'My Exams', path: '/student-dashboard/exams' },
    // { icon: <BarChart2 className="w-6 h-6" />, label: 'Results', path: '/student-dashboard/results' },
    { icon: <User className="w-6 h-6" />, label: 'Profile', path: '/student-dashboard/profile' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : studentNavItems;
  const currentPath = window.location.pathname;

  const isActiveRoute = (path: string) => {
    if (path === '/admin-dashboard' || path === '/student-dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div
      className={`
        ${collapsed ? 'w-20' : 'w-64'} 
        bg-gray-50 
        fixed top-0 left-0 
        h-full 
        flex flex-col 
        transition-all duration-300 ease-in-out 
        shadow-lg
        z-30
        ${className}
        border-r border-gray-200
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-4 border-b border-red-400 bg-white shadow-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm">
            <img src={logo} alt="Logo" className="h-full w-auto" />
          </div>
          {!collapsed && (
            <div className="ml-2">
              <h2 className="text-lg font-bold text-gray-800">Crimson College</h2>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 italic">Of Technology</p>
                <div className="w-9 h-0.5 bg-red-600 ml-2 mt-3"></div>
              </div>
            </div>
          )}
        </div>


        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(true)}
          className={`
            ${collapsed ? 'hidden' : 'flex'} 
            p-1.5 rounded-lg 
            bg-red-50 hover:bg-red-100 
            text-red-600 
            transition
            mb-6
          `}
          title="Collapse sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-6 space-y-1">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.path}
            onClick={(e) => handleNavClick(item.path, e)}
            className={`
              flex items-center group
              ${collapsed ? 'justify-center p-3' : 'justify-start px-3 py-3 ml-1 mr-2'}
              rounded-lg
              transition-all duration-200
              ${isActiveRoute(item.path)
                ? 'bg-red-100 text-red-700 font-medium border-l-2 border-red-500'
                : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
              }
              ${!collapsed && 'gap-3'}
            `}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Expand Button (Only shown when collapsed) */}
      {collapsed && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
            title="Expand sidebar"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center
            ${collapsed ? 'justify-center p-3' : 'justify-start px-3 py-3 gap-3'}
            rounded-lg
            text-gray-700 hover:bg-red-600 hover:text-white
            transition-all duration-200
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-6 h-6" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default SidePanel;