'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return unsubscribe;
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Header />

      <main className="container py-16 max-w-6xl mx-auto">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-6xl font-semibold text-gray-900 mb-6 dark:text-slate-100">
            Welcome to AI Text Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto dark:text-slate-400">
            Transform your text with powerful AI-driven sentiment analysis, keyword extraction, and intelligent summaries.
            Get started by signing in to access your dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow border border-slate-200 dark:bg-slate-800 dark:border-slate-700 backdrop-blur-sm">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">AI-Powered Analysis</h3>
            <p className="text-muted-foreground dark:text-slate-400">
              Advanced machine learning algorithms analyze your text for sentiment, keywords, and insights.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow border border-slate-200 dark:bg-slate-800 dark:border-slate-700 backdrop-blur-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">Fast & Accurate</h3>
            <p className="text-muted-foreground dark:text-slate-400">
              Get instant results with high accuracy and detailed analysis reports.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow border border-slate-200 dark:bg-slate-800 dark:border-slate-700 backdrop-blur-sm">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">Secure & Private</h3>
            <p className="text-muted-foreground dark:text-slate-400">
              Your data is encrypted and secure. We never store your personal text content.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
