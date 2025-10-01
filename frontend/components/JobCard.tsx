import React, { useState } from 'react';
import { Job, deleteJob } from '../lib/api';
import { auth } from '../lib/firebase';
import { getIdToken } from 'firebase/auth';

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await getIdToken(user);
      await deleteJob(job.id, token);
      onDelete(job.id);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'pending':
      default:
        return '⏳';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getJobTitle = (text: string) => {
    const words = text.trim().split(/\s+/).slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words || 'Untitled Analysis';
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`border-2 ${getStatusColor(job.status)} rounded-xl p-5 mb-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow ${getStatusColor(job.status)}`}>
            {getStatusIcon(job.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              "{getJobTitle(job.text)}"
            </h3>
            <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
              <span className="flex items-center">
                <span className="mr-2">📅</span>
                {formatDate(job.createdAt)}
              </span>
              {job.completedAt && (
                <span className="flex items-center text-emerald-600">
                  <span className="mr-2">✅</span>
                  Completed {formatDate(job.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete job"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow ${getStatusColor(job.status)}`}>
            <span className="mr-1 text-sm">{getStatusIcon(job.status)}</span>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-700 font-medium">Original Text</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <div className={`text-gray-600 transition-all duration-300 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
          {isExpanded ? job.text : truncateText(job.text, 150)}
        </div>
      </div>

      {job.status === 'completed' && job.result && (
        <div className="mt-5 p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2 shadow">
              <span className="text-white text-xs">📊</span>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Analysis Results</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow hover:shadow transition-all duration-200">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-2">
                  <span className="text-white text-xs">📝</span>
                </div>
                <p className="text-slate-700 font-bold text-sm">Summary</p>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{job.result.summary}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white text-xs">😊</span>
                </div>
                <p className="text-slate-700 font-bold text-base">Sentiment</p>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-base font-bold shadow-sm ${
                job.result.sentiment === 'positive'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : job.result.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                <span className="mr-2 text-lg">
                  {job.result.sentiment === 'positive' ? '😊' : job.result.sentiment === 'negative' ? '😠' : '😐'}
                </span>
                {job.result.sentiment.charAt(0).toUpperCase() + job.result.sentiment.slice(1)}
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white text-xs">🏷️</span>
                </div>
                <p className="text-slate-700 font-bold text-base">Keywords</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.result.keywords.slice(0, 6).map((keyword, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 border border-blue-200">
                    {keyword}
                  </span>
                ))}
                {job.result.keywords.length > 6 && (
                  <span className="text-sm text-slate-500 px-3 py-1 font-medium">
                    +{job.result.keywords.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {job.status === 'failed' && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <p className="text-red-800 font-medium">Analysis failed. Please try again.</p>
          </div>
        </div>
      )}

      {job.status === 'pending' && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm animate-spin">⏳</span>
            </div>
            <p className="text-yellow-800 font-medium">Analysis in progress...</p>
          </div>
        </div>
      )}
    </div>
  );
}
