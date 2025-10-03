'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSingleJob } from '@/lib/api';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Copy, Download, Share } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AnalysisDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);

  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
      router.push('/playground');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        try {
          // Get the user's ID token for API authentication
          const token = await getIdToken(user);

          // Fetch job data from API
          const jobData = await getSingleJob(id, token);
          setJob(jobData);
        } catch (error) {
          console.error('Error fetching job:', error);
          toast({
            title: "Error",
            description: "Failed to load analysis details. Please try again.",
            variant: "destructive",
          });
          router.push('/playground');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router, id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="container py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Analysis Details</h1>
        </div>

        {job && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Analysis Results</CardTitle>
                      <CardDescription>Generated on {formatDate(job.completedAt)}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Original Text</h3>
                      <div className="max-h-40 overflow-y-auto text-sm bg-muted p-4 rounded-lg">
                        {job.text}
                      </div>
                    </div>

                    {job.result.sentiment && (
                      <div>
                        <h3 className="font-medium mb-2">Sentiment Analysis</h3>
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-2">
                            {job.result.sentiment === 'positive' ? '😊' :
                             job.result.sentiment === 'negative' ? '😠' : '😐'}
                          </div>
                          <p className="font-medium capitalize">{job.result.sentiment} Sentiment</p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Positive</span>
                              <span>{job.result.positiveScore}%</span>
                            </div>
                            <Progress value={job.result.positiveScore} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Neutral</span>
                              <span>{job.result.neutralScore}%</span>
                            </div>
                            <Progress value={job.result.neutralScore} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Negative</span>
                              <span>{job.result.negativeScore}%</span>
                            </div>
                            <Progress value={job.result.negativeScore} className="h-2" />
                          </div>
                        </div>
                      </div>
                    )}

                    {job.result.keywords && (
                      <div>
                        <h3 className="font-medium mb-2">Key Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.result.keywords.map((keyword: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="py-2 px-3 cursor-pointer"
                              onClick={() => copyToClipboard(keyword)}
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.result.summary && (
                      <div>
                        <h3 className="font-medium mb-2">Smart Summary</h3>
                        <div className="border rounded-lg p-4">
                          <p className="text-sm">{job.result.summary}</p>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline">
                            Compression: {Math.round((1 - job.result.summary.length / job.text.length) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Save or share your analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Results
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{job.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(job.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="font-medium">{formatDate(job.completedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Text Length</p>
                      <p className="font-medium">{job.text.length} characters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
