'use client';

import React, { useState } from 'react';
import { analyzeText } from '../lib/api';
import { auth } from '../lib/firebase';
import { getIdToken } from 'firebase/auth';

interface TextSubmissionFormProps {
  userId: string;
  onAnalysisSubmitted: () => void;
}

export default function TextSubmissionForm({ userId, onAnalysisSubmitted }: TextSubmissionFormProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim().length === 0) {
      setError('Please enter some text to analyze');
      return;
    }
    
    if (text.length > 20000) {
      setError('Text exceeds maximum length of 20000 characters');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get a fresh ID token before each request
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await getIdToken(user);
      await analyzeText(text, token);
      setText('');
      onAnalysisSubmitted();
    } catch (err: any) {
      if (err.message && err.message.includes('Authentication failed')) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError('Failed to submit text for analysis. Please try again.');
      }
      console.error('Analysis error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center mr-2">
          <span className="text-white text-base">📝</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">AI Text Analysis</h2>
          <p className="text-slate-600 text-sm">Transform your text with advanced AI insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Enter your text for analysis
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here for AI-powered analysis..."
            className={`w-full h-40 p-3 border rounded resize-none transition-all text-sm ${
              isSubmitting
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed text-gray-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400 text-gray-800'
            }`}
            disabled={isSubmitting}
          />

          {/* Enhanced Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-slate-500">
              AI-powered analysis includes sentiment, keywords, and summaries
            </div>
            <div className={`px-2 py-1 rounded text-xs font-semibold ${
              text.length > 18000 ? 'bg-red-100 text-red-700' :
              text.length > 15000 ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {text.length}/20000
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">⚠️</span>
              </div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="flex items-center space-x-4 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
              Sentiment
            </span>
            <span className="inline-flex items-center text-blue-600 font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Keywords
            </span>
            <span className="inline-flex items-center text-purple-600 font-medium">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
              Summary
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || text.trim().length === 0}
            className={`px-4 py-2 rounded font-bold text-white text-sm transition-all ${
              isSubmitting || text.trim().length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow hover:shadow-md'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2 text-base">🚀</span>
                Analyze Text
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}