"use client";

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 transition-colors duration-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo and Title */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110">
            <span className="text-xl">🧠</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">AI Text Analysis</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden md:inline-flex text-gray-700 dark:text-slate-300">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
