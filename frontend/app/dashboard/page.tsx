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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/90 backdrop-blur-md shadow border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
              <span className="text-white text-xl">🧠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                AI Text Analysis
              </h1>
              <p className="text-slate-600 text-sm">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-lg text-slate-700 font-medium transition-all hover:shadow"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <div className="space-y-6">
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