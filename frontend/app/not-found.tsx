'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Header />
      
      <main className="container py-16 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4 dark:text-slate-100">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-slate-100">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md dark:text-slate-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              <Link href="/playground">Go to Playground</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
