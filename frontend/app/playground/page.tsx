'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Header } from '@/components/header';
import { TextInputSection } from '@/components/text-input-section';
import { ResultsSection } from '@/components/results-section';
import { StatsWidget } from '@/components/stats-widget';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserJobs, analyzeText } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchRecentJobs = async (currentUser: any) => {
    if (!currentUser) return;

    try {
      const token = await getIdToken(currentUser);
      const response = await getUserJobs(currentUser.uid, token, 1, 3); // Get first 3 jobs
      // Sort jobs by createdAt descending (newest first)
      const sortedJobs = response.jobs.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchAllJobs = async (currentUser: any) => {
    if (!currentUser) return;

    try {
      const token = await getIdToken(currentUser);
      const response = await getUserJobs(currentUser.uid, token, 1, 1000); // Get all jobs
      setAllJobs(response.jobs);
    } catch (error) {
      console.error('Failed to fetch all jobs:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        await Promise.all([fetchRecentJobs(user), fetchAllJobs(user)]);
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router]);

  const handleAnalyze = async (text: string, mode: string) => {
    setIsAnalyzing(true);

    try {
      const token = await getIdToken(user);
      await analyzeText(text, token, mode);

      toast({
        title: "Analysis Started",
        description: `Your text is being analyzed in ${mode} mode. Check back in a moment.`,
      });

      // Refresh jobs after a short delay
      setTimeout(() => {
        fetchRecentJobs(user);
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit text for analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchRecentJobs(user), fetchAllJobs(user)]);
    toast({
      title: "Refreshed",
      description: "Jobs list updated",
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground dark:text-slate-400">Loading your playground...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Header />

      <main className="container py-8 max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 dark:text-slate-100">
            AI Text Analysis Playground
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-3xl mx-auto">
            Transform your text with powerful AI-driven sentiment analysis, keyword extraction, and intelligent summaries
          </p>
        </div>

        {/* Stats Widget */}
        <div className="mb-8 animate-fade-in">
          <StatsWidget jobs={allJobs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <TextInputSection
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 sticky top-24 dark:bg-slate-800 dark:border-slate-700 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 dark:text-slate-100 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                How It Works
              </h2>
               <div className="space-y-4">
                <div className="flex items-start group hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-slate-100">Submit Text</h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Enter or upload your text for analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start group hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-slate-100">AI Processing</h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Our advanced AI analyzes your content
                    </p>
                  </div>
                </div>
                <div className="flex items-start group hover:scale-105 transition-transform duration-200">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-slate-100">Get Insights</h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Receive detailed analysis and insights
                    </p>
                  </div>
                </div>
              </div>
              
              {jobs.length > 2 && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/history">
                    <Button variant="outline" className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 hover:scale-105 transition-transform duration-200">
                      View All {jobs.length} Analyses →
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <ResultsSection
          jobs={jobs}
          loading={false}
          onRefresh={handleRefresh}
          onDeleteJob={handleDeleteJob}
          title="Recent Analyses"
        />
      </main>
    </div>
  );
}
