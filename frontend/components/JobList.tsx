'use client';

import React, { useEffect, useState } from 'react';
import { Job, getUserJobs } from '../lib/api';
import JobCard from './JobCard';
import { auth } from '../lib/firebase';
import { getIdToken } from 'firebase/auth';

interface JobListProps {
  userId: string;
}

export default function JobList({ userId }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const jobsPerPage = 10;

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Get a fresh ID token before each request
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await getIdToken(user);
      const response = await getUserJobs(userId, token, page, jobsPerPage, debouncedSearch);
      setJobs(response.jobs);
      setTotalJobs(response.total);
      setError('');
    } catch (err: any) {
      if (err.message && err.message.includes('Authentication failed')) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError('Failed to fetch jobs. Please try again.');
      }
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
  }, [userId, page, debouncedSearch]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

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
    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200/60">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center mr-3 shadow">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow">
            <span className="text-white text-base">📋</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Analysis Jobs</h2>
            <p className="text-slate-600 font-medium">
              {totalJobs} job{totalJobs !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              loading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:shadow'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2 text-base">🔄</span>
                Refresh
              </span>
            )}
          </button>
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Analysis Jobs Yet</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto text-base leading-relaxed">
            Ready to unlock AI-powered insights? Submit your first text for analysis.
          </p>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDeleteJob} />
          ))}
          
          {/* Pagination */}
          {totalJobs > jobsPerPage && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${
                  page === 1 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-slate-600">
                Page {page} of {Math.ceil(totalJobs / jobsPerPage)}
              </span>
              
              <button
                onClick={() => setPage(page < Math.ceil(totalJobs / jobsPerPage) ? page + 1 : page)}
                disabled={page === Math.ceil(totalJobs / jobsPerPage)}
                className={`px-4 py-2 rounded-lg ${
                  page === Math.ceil(totalJobs / jobsPerPage)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}