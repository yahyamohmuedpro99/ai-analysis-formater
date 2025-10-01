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
    <div className="bg-white rounded-2xl shadow-2xl p-10 border border-slate-200/60">
      <div className="flex items-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <span className="text-white text-2xl">📝</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-1">AI Text Analysis</h2>
          <p className="text-slate-600 font-medium">Transform your text with advanced AI insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-base font-semibold text-slate-800 mb-3">
            Enter your text for analysis
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here for AI-powered analysis..."
            className={`w-full h-52 p-5 border-2 rounded-xl resize-none transition-all duration-300 text-base ${
              isSubmitting
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed text-gray-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-400 text-gray-800'
            }`}
            disabled={isSubmitting}
          />

          {/* Enhanced Character Counter */}
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-slate-500">
              AI-powered analysis includes sentiment, keywords, and summaries
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
              text.length > 18000 ? 'bg-red-100 text-red-700' :
              text.length > 15000 ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {text.length}/20000
            </div>
          </div>
        </div>

        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-6 text-sm">
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Sentiment Analysis
            </span>
            <span className="inline-flex items-center text-blue-600 font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Key Insights
            </span>
            <span className="inline-flex items-center text-purple-600 font-medium">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Smart Summary
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || text.trim().length === 0}
            className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
              isSubmitting || text.trim().length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-xl hover:shadow-2xl'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Text...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-3 text-xl">🚀</span>
                Analyze Text
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}