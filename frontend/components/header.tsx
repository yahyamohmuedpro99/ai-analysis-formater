"use client";

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { MobileNav } from '@/components/mobile-nav';
import { UserMenu } from '@/components/user-menu';
import { NotificationBadge } from '@/components/notification-badge';

export function Header() {
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-slate-900 backdrop-blur-md dark:bg-slate-900 dark:border-slate-700">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-2">
          <MobileNav />
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center dark:bg-slate-200">
              <span className="text-xl">🧠</span>
            </div>
            <span className="text-lg font-bold text-white">AI Text Analysis</span>
          </Link>
        </div>
        
        {/* Center: Navigation */}
        <div className="hidden md:flex">
          <Navigation />
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationBadge />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
