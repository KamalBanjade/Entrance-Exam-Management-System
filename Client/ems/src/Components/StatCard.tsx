import React from 'react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
  subtitle?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon, // Rename to Icon for clarity
  color,
  bgColor,
  subtitle,
  isLoading = false,
}) => {
  return (
    <div
      className={`${bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        {/* Text Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-[#666666]">{title}</p>
          <div className={`text-3xl font-bold ${color} mt-2 tracking-tight`}>
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#666666] mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Icon Circle */}
        <div
          className={`${color} ${bgColor} p-4 rounded-xl shadow-inner border-2 flex items-center justify-center`}
          style={{ borderColor: 'rgba(0,0,0,0.1)' }}
        >
          <div className="transform scale-110">
            <Icon size={24} className="text-red drop-shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};