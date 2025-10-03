'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing-header';
import { Sparkles, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/playground');
      }
    });

    return unsubscribe;
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <LandingHeader />

      <main className="container py-16 max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-up mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by OpenAI GPT-4
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 dark:text-slate-100 leading-tight">
            Transform Text into
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto dark:text-slate-300">
            Harness the power of AI to analyze sentiment, extract keywords, and generate intelligent summaries from any text in seconds.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-slate-100">AI-Powered Analysis</h3>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
              Advanced GPT-4 algorithms analyze your text for sentiment, keywords, and generate concise summaries with remarkable accuracy.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-slate-100">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
              Get instant results with asynchronous processing. Submit your text and receive detailed analysis in seconds, not minutes.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-slate-100">Secure & Private</h3>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
              Your data is encrypted and secure with Firebase Authentication. We prioritize your privacy and never share your content.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Everything You Need to Analyze Text
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400">
              Comprehensive analysis tools at your fingertips
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Sentiment analysis with detailed scoring",
              "Automatic keyword extraction",
              "Intelligent text summarization",
              "Real-time job status tracking",
              "Complete analysis history",
              "Export results as PDF or JSON",
              "Dark mode support",
              "Responsive mobile design"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-lg text-gray-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of users analyzing text with AI
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:shadow-xl">
            <Link href="/signup">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
