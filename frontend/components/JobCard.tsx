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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
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
      setShowDeleteModal(false);
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
    <div className={`border ${getStatusColor(job.status)} rounded-lg p-4 mb-4 hover:shadow transition-all duration-200 bg-white`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getStatusColor(job.status)}`}>
            {getStatusIcon(job.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              "{getJobTitle(job.text)}"
            </h3>
            <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
              <span className="flex items-center">
                <span className="mr-1">📅</span>
                {formatDate(job.createdAt)}
              </span>
              {job.completedAt && (
                <span className="flex items-center text-emerald-600">
                  <span className="mr-1">✅</span>
                  Completed {formatDate(job.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete job"
          >
            {isDeleting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getStatusColor(job.status)}`}>
            <span className="mr-1 text-xs">{getStatusIcon(job.status)}</span>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-gray-700 font-medium text-sm">Original Text</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <div className={`text-gray-600 transition-all duration-300 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
          {isExpanded ? job.text : truncateText(job.text, 100)}
        </div>
      </div>

      {job.status === 'completed' && job.result && (
        <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center mr-2">
              <span className="text-white text-xs">📊</span>
            </div>
            <h4 className="text-base font-bold text-slate-800">Analysis Results</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded border border-slate-200">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center mr-1">
                  <span className="text-white text-xs">📝</span>
                </div>
                <p className="text-slate-700 font-bold text-xs">Summary</p>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{job.result.summary}</p>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center mr-1">
                  <span className="text-white text-xs">😊</span>
                </div>
                <p className="text-slate-700 font-bold text-xs">Sentiment</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                job.result.sentiment === 'positive'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : job.result.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                <span className="mr-1 text-xs">
                  {job.result.sentiment === 'positive' ? '😊' : job.result.sentiment === 'negative' ? '😠' : '😐'}
                </span>
                {job.result.sentiment.charAt(0).toUpperCase() + job.result.sentiment.slice(1)}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center mr-1">
                  <span className="text-white text-xs">🏷️</span>
                </div>
                <p className="text-slate-700 font-bold text-xs">Keywords</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {job.result.keywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                    {keyword}
                  </span>
                ))}
                {job.result.keywords.length > 3 && (
                  <span className="text-xs text-slate-500 px-2 py-0.5 font-medium">
                    +{job.result.keywords.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {job.status === 'failed' && (
        <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">⚠️</span>
            </div>
            <p className="text-red-800 font-medium text-sm">Analysis failed. Please try again.</p>
          </div>
        </div>
      )}

      {job.status === 'pending' && (
        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs animate-spin">⏳</span>
            </div>
            <p className="text-yellow-800 font-medium text-sm">Analysis in progress...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Job</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this analysis job? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}