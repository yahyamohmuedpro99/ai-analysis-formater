'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getIdToken, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import TextSubmissionForm from '../../components/TextSubmissionForm';
import JobList from '../../components/JobList';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router]);

  const handleAnalysisSubmitted = () => {
    // Refresh jobs list after submission
    // The JobList component already has polling, so this is just for immediate feedback
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🧠</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                AI Text Analysis
              </h1>
              <p className="text-slate-600 font-medium">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="px-8 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl text-slate-700 font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-8 sm:px-0 space-y-12">
          <TextSubmissionForm
            userId={user!.uid}
            onAnalysisSubmitted={handleAnalysisSubmitted}
          />
          <JobList userId={user!.uid} />
        </div>
      </main>
    </div>
  );
}