import React, { useEffect, useState } from 'react';
import type { Answer } from '../types';
import { apiService } from '../services/apiService';
import { FiDownload, FiMail, FiX, FiEye, FiUser, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { generateResultPDFWithQuestions, fetchQuestionsForResult } from '../services/pdfService';

export const ResultsPage: React.FC = () => {
  const [program, setProgram] = useState<string>('all');
  const [results, setResults] = useState<Answer[]>([]);
  const [selectedResult, setSelectedResult] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getResultsByProgram('');
        console.log('Fetched results:', data);

        let filteredResults = Array.isArray(data) ? [...data] : [];

        if (program !== 'all') {
          filteredResults = filteredResults.filter(
            (result) => result.studentId?.program === program
          );
        }

        const sortedResults = filteredResults
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((result, index) => ({
            ...result,
            rank: index + 1,
          }));

        setResults(sortedResults);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [program]);

  const handleDownloadPDF = async (result: Answer) => {
    try {
      // Show loading toast
      toast.info('📄 Generating simple report...');

      // Fetch full question details (text, options) using the exported service function
      const questions = await fetchQuestionsForResult(result, apiService);

      // Generate the simple text-based PDF (fast and reliable)
      await generateResultPDFWithQuestions(result, questions);

      // Success
      toast.success('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('❌ Failed to generate PDF. Please try again.');
    }
  };

  const handleSendCongrats = async (resultId: string) => {
    if (!resultId) {
      console.error('Invalid resultId:', resultId);
      toast.error('❌ Invalid result ID');
      return;
    }

    // Optional: Add row-level loading state
    setResults((prev) =>
      prev.map((result) =>
        result._id === resultId
          ? { ...result, sending: true }
          : result
      )
    );

    try {
      const response = await apiService.sendCongratulationEmail(resultId);
      if (response.success) {
        setResults((prev) =>
          prev.map((result) =>
            result._id === resultId
              ? { ...result, congratulationSent: true, sending: false }
              : result
          )
        );
        toast.success('Congratulations email sent!');
      } else {
        throw new Error(response.message || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(`Failed: ${error.message || 'Unknown error'}`);
      // Revert loading state on error
      setResults((prev) =>
        prev.map((result) =>
          result._id === resultId ? { ...result, sending: false } : result
        )
      );
    }
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgram(e.target.value);
  };

  // Add this in your handleViewDetails function to inspect the data structure
  const handleViewDetails = (result: Answer) => {
    setSelectedResult(result);
  };

  const closeModal = () => {
    setSelectedResult(null);
  };

  // Skeleton Loader
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 bg-gray-200 rounded-md"></div>
        </td>
      ))}
    </tr>
  );

  if (loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#666666]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#DC143C] mb-4"></div>
        <p className="text-lg font-medium">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-6 border-red-500 p-5 rounded-lg shadow-sm max-w-xl mx-auto">
        <h3 className="text-red-800 font-semibold text-lg">⚠️ Error</h3>
        <p className="text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333] flex items-center">
              <FiEye className="mr-3 text-[#DC143C]" size={28} />
              Exam Results
            </h1>
            <p className="text-[#666666] mt-1">View and manage student performance across programs.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <label htmlFor="program-filter" className="text-sm font-medium text-[#333333] min-w-max">
              Filter by Program
            </label>
            <select
              id="program-filter"
              value={program}
              onChange={handleProgramChange}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#DC143C] focus:border-[#DC143C] transition-all duration-200 shadow-sm bg-white text-[#333333]"
            >
              <option value="all">All Programs</option>
              <option value="BCSIT">BCSIT</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
            </select>
          </div>
        </header>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : results.length > 0 ? (
                  results.map((result) => (
                    <tr
                      key={result._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-bold ${result.rank === 1
                            ? 'text-amber-600'
                            : result.rank === 2
                              ? 'text-gray-500'
                              : result.rank === 3
                                ? 'text-amber-800'
                                : 'text-[#333333]'
                            }`}
                        >
                          #{result.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex-shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-[#DC143C] font-bold shadow-lg`}
                          >
                            {result.studentId?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#333333] truncate max-w-xs">
                              {result.studentId?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-[#666666] truncate max-w-xs">
                              {result.studentId?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full capitalize ${result.studentId?.program === 'BSCIT'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : result.studentId?.program === 'BCA'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : result.studentId?.program === 'BBA'
                                ? 'bg-red-50 text-[#DC143C] border border-[#DC143C]/30'
                                : 'bg-gray-50 text-gray-800 border border-gray-200'
                            }`}
                        >
                          {result.studentId?.program || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#333333]">
                          {result.examId?.title || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#666666]">
                          {result.examId?.date
                            ? new Date(result.examId.date).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#333333]">
                          {result.score ?? 0}/{result.totalQuestions ?? 0}
                        </div>
                        <div className="text-xs text-[#666666]">({result.percentage?.toFixed(1) ?? 0}%)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${result.result === 'pass'
                            ? 'bg-green-100 text-green-800'
                            : result.result === 'fail'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {result.result?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleViewDetails(result)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[#DC143C] hover:text-[#c41234] hover:bg-red-50 rounded-lg transition-all duration-150 text-xs font-medium"
                          title="View Details"
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          onClick={() => handleSendCongrats(result._id)}
                          disabled={result.congratulationSent || result.sending}
                          className={`
                          flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 transform
                          ${result.congratulationSent
                              ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                              : result.sending
                                ? 'text-red-500 cursor-wait animate-pulse'
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:scale-105'
                            }
  `}
                          title={result.congratulationSent ? 'Sent' : 'Send Congratulations'}
                        >
                          {result.sending ? (
                            <FiMail size={14} className="animate-spin" />
                          ) : result.congratulationSent ? (
                            <span
                              className="sent-success"
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              ✓
                            </span>
                          ) : (
                            <FiMail size={14} />
                          )}
                          <span>{result.sending ? 'Sending...' : result.congratulationSent ? 'Sent' : 'Send'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#666666]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FiEye className="text-[#666666]" size={40} />
                        <p className="text-lg font-medium text-[#333333]">No results found</p>
                        <p className="text-sm text-[#666666]">
                          Try selecting a different program or check back later.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result Details Modal */}
        {selectedResult && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center bg-[#DC143C] text-white p-6">
                <h2 className="text-xl font-bold">Result Details</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition"
                  aria-label="Close modal"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Student & Exam Info */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333] mb-3 flex items-center gap-2">
                      <FiUser className="text-[#DC143C]" /> Student Information
                    </h3>
                    <ul className="space-y-2 text-sm text-[#333333]">
                      <li><strong>Name:</strong> {selectedResult.studentId?.name || 'N/A'}</li>
                      <li><strong>Email:</strong> {selectedResult.studentId?.email || 'N/A'}</li>
                      <li><strong>Program:</strong> {selectedResult.studentId?.program || 'N/A'}</li>
                      <li><strong>ID:</strong> {selectedResult.studentId?._id || 'N/A'}</li>
                    </ul>
                  </div>

                  {/* Exam & Result */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333] mb-3 flex items-center gap-2">
                      <FiBook className="text-[#DC143C]" /> Exam & Performance
                    </h3>
                    <ul className="space-y-2 text-sm text-[#333333]">
                      <li><strong>Exam:</strong> {selectedResult.examId?.title || 'N/A'}</li>
                      <li>
                        <strong>Date:</strong>{' '}
                        {selectedResult.examId?.date
                          ? new Date(selectedResult.examId.date).toLocaleDateString()
                          : 'N/A'}
                      </li>
                      <li>
                        <strong>Score:</strong>{' '}
                        {selectedResult.score ?? 0}/{selectedResult.totalQuestions ?? 0}{' '}
                        <span className="text-[#666666]">({selectedResult.percentage?.toFixed(2) ?? 0}%)</span>
                      </li>
                      <li>
                        <strong>Status:</strong>{' '}
                        <span
                          className={
                            selectedResult.result === 'pass'
                              ? 'text-green-700 font-medium'
                              : selectedResult.result === 'fail'
                                ? 'text-red-700 font-medium'
                                : 'text-gray-600 font-medium'
                          }
                        >
                          {selectedResult.result?.toUpperCase() || 'PENDING'}
                        </span>
                      </li>
                      <li>
                        <strong>Rank:</strong> #{selectedResult.rank || '–'}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => handleDownloadPDF(selectedResult)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#DC143C] hover:bg-[#c41234] text-white font-medium rounded-lg transition"
                  >
                    <FiDownload size={16} /> Detailed Report
                  </button>
                </div>
              </div>

              {/* Answer Breakdown */}
              <div className="p-6 space-y-4 max-h-[calc(90vh-320px)] overflow-y-auto">
                <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
                  <FiEye className="text-[#DC143C]" /> Answer Breakdown
                </h3>
                {selectedResult.validationDetails && selectedResult.validationDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-[#333333] text-xs uppercase tracking-wide">
                            Question
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#333333] text-xs uppercase tracking-wide">
                            Your Answer
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#333333] text-xs uppercase tracking-wide">
                            Correct Answer
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#333333] text-xs uppercase tracking-wide">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedResult.validationDetails.map((detail, index) => (
                          <tr key={index} className="hover:bg-gray-25 transition duration-100">
                            <td className="px-4 py-3 text-[#333333] max-w-xs truncate">
                              {detail.questionText || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-[#666666]">{detail.selectedAnswer || '–'}</td>
                            <td className="px-4 py-3 text-[#333333] font-medium">
                              {detail.correctAnswer || '–'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${detail.isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#666666] text-center py-8">No detailed answers available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};