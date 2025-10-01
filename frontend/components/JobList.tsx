'use client';

import React, { useEffect, useState } from 'react';
import { Job, getUserJobs } from '../lib/api';
import JobCard from './JobCard';

interface JobListProps {
  userId: string;
  idToken: string;
}

export default function JobList({ userId, idToken }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getUserJobs(userId, idToken);
      setJobs(response.jobs);
      setError('');
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Set up polling for job updates (every 10 seconds)
    const interval = setInterval(fetchJobs, 10000);
    
    return () => clearInterval(interval);
  }, [userId, idToken]);

  if (loading && jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your analysis jobs...</p>
          <p className="text-gray-500 text-sm mt-1">This should only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-10 border border-slate-200/60">
      {error && (
        <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-white text-base">⚠️</span>
            </div>
            <p className="text-red-800 font-bold text-lg">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white text-xl">📋</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-1">Your Analysis Jobs</h2>
            <p className="text-slate-600 font-semibold text-lg">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className={`px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
            loading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:shadow-lg hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-3 text-lg">🔄</span>
              Refresh
            </span>
          )}
        </button>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-5xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No Analysis Jobs Yet</h3>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Ready to unlock AI-powered insights? Submit your first text for analysis and discover sentiment patterns, key themes, and intelligent summaries.
          </p>
          <div className="flex items-center justify-center space-x-10 text-base">
            <div className="flex items-center text-emerald-600 font-semibold">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-sm"></div>
              Sentiment Analysis
            </div>
            <div className="flex items-center text-blue-600 font-semibold">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-sm"></div>
              Key Insights
            </div>
            <div className="flex items-center text-purple-600 font-semibold">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 shadow-sm"></div>
              Smart Summary
            </div>
          </div>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
