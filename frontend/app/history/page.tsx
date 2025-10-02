'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Header } from '@/components/header';
import { ResultsSection } from '@/components/results-section';
import { useToast } from '@/components/ui/use-toast';
import { getUserJobs } from '@/lib/api';

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const fetchJobs = async (currentUser: any, page: number = 1) => {
    if (!currentUser) return;

    try {
      const token = await getIdToken(currentUser);
      const response = await getUserJobs(currentUser.uid, token, page, 5);
      setJobs(response.jobs);
      setTotalJobs(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        await fetchJobs(user, 1);
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router]);

  const handleRefresh = async () => {
    await fetchJobs(user, currentPage);
    toast({
      title: "Refreshed",
      description: "Jobs list updated",
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    setTotalJobs(totalJobs - 1);
  };

  const handlePageChange = async (page: number) => {
    await fetchJobs(user, page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Header />
      
      <main className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-slate-100">Analysis History</h1>
          <p className="text-muted-foreground dark:text-slate-400">View all your previous text analyses</p>
        </div>
        
        <ResultsSection
          jobs={jobs}
          loading={false}
          onRefresh={handleRefresh}
          onDeleteJob={handleDeleteJob}
          currentPage={currentPage}
          totalJobs={totalJobs}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
