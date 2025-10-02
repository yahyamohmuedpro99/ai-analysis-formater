'use client';

import { ThemeTest } from '@/components/theme-test';
import { DarkModeTest } from '@/components/dark-mode-test';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container py-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 dark:from-purple-400 dark:to-blue-400">
            Dark Mode Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-slate-400">
            This page tests the dark mode implementation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">UI Components</CardTitle>
              <CardDescription className="dark:text-slate-400">Testing various components in dark mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              
              <Input placeholder="Input field" />
              <Textarea placeholder="Textarea field" className="min-h-[100px]" />
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Theme Status</CardTitle>
                <CardDescription className="dark:text-slate-400">Current theme information</CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeTest />
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Dark Mode Test</CardTitle>
                <CardDescription className="dark:text-slate-400">Verify dark mode is working</CardDescription>
              </CardHeader>
              <CardContent>
                <DarkModeTest />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}