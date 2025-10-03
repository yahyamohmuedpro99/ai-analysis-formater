'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/playground');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse-slow">
            <span className="text-4xl">🧠</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground dark:text-slate-400">
            Sign in to continue to your dashboard
          </p>
        </div>

        <Card className="border-2 shadow-xl dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Sign In</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-slate-300">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
