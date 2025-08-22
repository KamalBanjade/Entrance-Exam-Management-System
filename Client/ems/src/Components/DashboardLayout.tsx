import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidePanel from './SidePanel';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <SidePanel
        userRole="admin"
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
        <header className="bg-white shadow-sm border-b border-red-300 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 mb-3">
              <h1 className="text-xl font-bold text-[#333333]">
                <span className="text-[#DC143C]">Admin</span>{' '}
                <span className="text-green-600">Dashboard</span>
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#DC143C] flex items-center justify-center text-white font-medium">A</div>
                <span className="text-sm font-medium text-[#333333] hidden md:inline">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;