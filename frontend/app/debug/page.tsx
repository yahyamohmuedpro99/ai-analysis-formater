'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { debugUtils } from '@/lib/debug-utils';
import { useTheme } from 'next-themes';

export default function DebugPage() {
  const { theme, setTheme } = useTheme();
  
  const handleLogTheme = () => {
    debugUtils.logThemeStatus();
  };
  
  const handleForceDark = () => {
    debugUtils.forceDarkMode();
  };
  
  const handleForceLight = () => {
    debugUtils.forceLightMode();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container py-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 dark:from-purple-400 dark:to-blue-400">
            Debug Page
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-slate-400">
            Debugging tools for the application
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">Theme Debug</CardTitle>
              <CardDescription className="dark:text-slate-400">Debug theme-related issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  Current theme: <span className="font-mono">{theme}</span>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleLogTheme}>Log Theme Status</Button>
                <Button onClick={handleForceDark} variant="outline">Force Dark Mode</Button>
                <Button onClick={handleForceLight} variant="outline">Force Light Mode</Button>
                <Button onClick={() => setTheme('dark')}>Set Theme to Dark</Button>
                <Button onClick={() => setTheme('light')}>Set Theme to Light</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">UI Component Test</CardTitle>
              <CardDescription className="dark:text-slate-400">Test various UI components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <h3 className="font-medium mb-2 dark:text-slate-100">Background Test</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    This should have a different background in dark mode
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-700 dark:to-blue-700">
                  <h3 className="font-medium mb-2 text-white">Gradient Test</h3>
                  <p className="text-sm text-white/90">
                    This gradient should look different in dark mode
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}