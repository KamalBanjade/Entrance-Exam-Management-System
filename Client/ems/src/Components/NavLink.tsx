import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  sidebarOpen: boolean;
  userRole?: 'admin' | 'student';
}

export const NavLink: React.FC<NavLinkProps> = ({ 
  to, 
  icon, 
  text, 
  sidebarOpen, 
  userRole = 'admin' 
}) => {
  const location = useLocation();
  
  const isActive = () => {
    if (to === '/admin-dashboard' || to === '/student-dashboard') {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const baseClasses = "flex items-center p-2 rounded-md transition-all duration-200";
  const adminActiveClasses = "bg-red-600 text-white";
  const adminInactiveClasses = "text-white hover:bg-red-600";
  const studentActiveClasses = "bg-gray-100 text-gray-900";
  const studentInactiveClasses = "text-gray-700 hover:bg-gray-100";

  const activeClasses = userRole === 'admin' ? adminActiveClasses : studentActiveClasses;
  const inactiveClasses = userRole === 'admin' ? adminInactiveClasses : studentInactiveClasses;

  return (
    <Link
      to={to}
      className={`${baseClasses} ${
        isActive() ? activeClasses : inactiveClasses
      } ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}`}
      title={!sidebarOpen ? text : undefined}
    >
      <span className="flex-shrink-0">
        {icon}
      </span>
      {sidebarOpen && (
        <span className="font-medium">
          {text}
        </span>
      )}
    </Link>
  );
};