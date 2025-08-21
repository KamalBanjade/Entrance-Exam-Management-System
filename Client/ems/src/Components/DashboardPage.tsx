import React, { useEffect, useState } from 'react';
import { FiBook, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { StatCard } from './StatCard';
import { RecentExamsList } from './RecentExamsList';
import { TopPerformersList } from './TopPerformersList';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

// Define types (or import from types.ts)
interface DashboardStats {
  scheduled: number;
  running: number;
  completed: number;
  cancelled: number;
  recentCompletions: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    scheduled: 0,
    running: 0,
    completed: 0,
    cancelled: 0,
    recentCompletions: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardStats(); // This returns { stats, runningExams, upcomingExams }

        setStats(data.stats || {
          scheduled: 0,
          running: 0,
          completed: 0,
          cancelled: 0,
          recentCompletions: 0,
        });
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard stats');
        // Set fallback values
        setStats({
          scheduled: 0,
          running: 0,
          completed: 0,
          cancelled: 0,
          recentCompletions: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Welcome, Admin!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={FiClock}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle="Upcoming exams"
          isLoading={loading}
        />

        {/* Active Exams */}
        <StatCard
          title="Active Exams"
          value={stats.running}
          icon={FiBook} // Pass component, not JSX element
          color="text-red-600"
          bgColor="bg-red-50"
          subtitle="Currently running"
          isLoading={loading}
        />

        {/* Completed Exams */}
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={FiCheckCircle} // Pass component, not JSX element
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle="Total finished"
          isLoading={loading}
        />

        {/* Cancelled Exams */}
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={FiXCircle} // Pass component, not JSX element
          color="text-red-600"
          bgColor="bg-red-50"
          subtitle="No longer active"
          isLoading={loading}
        />

        {/* Recent Completions (Last 24h) */}
        <StatCard
          title="Recent (24h)"
          value={stats.recentCompletions}
          icon={FiTrendingUp} // Pass component, not JSX element
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle="Last day"
          isLoading={loading}
        />
      </div>

      {/* Recent Exams & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-7">
          <RecentExamsList />
        </div>
        <div className="bg-white rounded-lg shadow p-7">
          <TopPerformersList />
        </div>
      </div>
    </div>
  );
};