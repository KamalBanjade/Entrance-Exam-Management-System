import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Answer } from '../types';
import { apiService } from '../services/apiService';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export const TopPerformersList: React.FC = () => {
  const [results, setResults] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<string>('all');

  const programs = [
    { value: 'all', label: 'All Programs' },
    { value: 'BCSIT', label: 'BCSIT' },
    { value: 'BCA', label: 'BCA' },
    { value: 'BBA', label: 'BBA' },
  ] as const;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getResultsByProgram('');
        const resultsArray = Array.isArray(data) ? data : [];

        const filteredResults = program === 'all'
          ? resultsArray
          : resultsArray.filter((r) => r.studentId?.program === program);

        const top5 = filteredResults
          .filter((r) => r.score !== undefined)
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 5);

        setResults(top5);
      } catch (err: any) {
        console.error('Error fetching top performers:', err);
        setError(err.message || 'Failed to load top performers');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [program]);

  return (
    <div className="bg-white p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-[#333333] flex items-center gap-4">
          🏆 Top Performers
        </h2>
        <span className="text-sm font-medium text-[#DC143C] bg-red-50 px-2.5 py-1 rounded-full">
          {results.length}
        </span>
      </div>

      <div className="mb-5">
        <label htmlFor="program-filter" className="block text-xs font-medium text-[#666666] mb-1">
          Filter by Program
        </label>
        <select
          id="program-filter"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] text-sm"
        >
          {programs.map((prog) => (
            <option key={prog.value} value={prog.value}>
              {prog.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin w-5 h-5 border-2 border-[#DC143C] border-t-transparent rounded-full mb-2"></div>
          <p className="text-[#666666] text-sm">Loading...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-6 text-red-600 text-sm">❌ {error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result._id}
                to="/admin-dashboard/results"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all hover:shadow"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#333333] truncate">
                    {result.studentId?.name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-[#666666] truncate">{result.examId?.title || 'N/A'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {result.studentId?.program || 'N/A'}
                  </span>
                </div>

                <div className="text-right text-sm">
                  <p className="font-bold text-[#333333]">{result.percentage?.toFixed(1)}%</p>
                  <p
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${result.result === 'pass'
                      ? 'bg-green-100 text-green-800 flex items-center gap-1'
                      : 'bg-red-100 text-red-800 flex items-center gap-1'
                      }`}
                  >
                    {result.result === 'pass' ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                    {result.result?.toUpperCase()}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-[#666666] text-center py-4 text-sm">No results found</p>
          )}
        </div>
      )}

      <Link
        to="/admin-dashboard/results"
        className="block text-center mt-5 text-[#DC143C] hover:text-[#c41234] font-medium text-sm transition"
      >
        🔍 View all results
      </Link>
    </div>
  );
};