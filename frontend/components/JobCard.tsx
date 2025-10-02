import React, { useState, useRef } from 'react';
import { Job, deleteJob } from '../lib/api';
import { auth } from '../lib/firebase';
import { getIdToken } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { AnalysisDetailsSheet } from '@/components/analysis-details-sheet';
import { FileText, Smile, Key, Trash2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInProgress = useRef(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (isDeleting || deleteInProgress.current) {
      console.log('Delete already in progress, skipping');
      return;
    }

    console.log('Starting delete for job:', job.id);
    deleteInProgress.current = true;

    try {
      setIsDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await getIdToken(user);
      console.log('Calling deleteJob API for job:', job.id);
      await deleteJob(job.id, token);
      console.log('Delete API call successful, calling onDelete');
      onDelete(job.id);
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      deleteInProgress.current = false;
      console.log('Delete operation completed');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getBorderAccentColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500';
      case 'failed':
        return 'border-l-red-500';
      case 'pending':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Processing';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getJobTitle = (text: string) => {
    const words = text.trim().split(/\s+/).slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words || 'Untitled Analysis';
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={`transition-all hover:shadow-xl hover:scale-[1.02] duration-200 dark:bg-slate-800 dark:border-slate-700 border-l-4 ${getBorderAccentColor(job.status)}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 dark:text-slate-100">
              "{getJobTitle(job.text)}"
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 dark:text-slate-400">
              <span>{formatDate(job.createdAt)}</span>
              {job.completedAt && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Completed {formatDate(job.completedAt)}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(job.status)}>
              {getStatusText(job.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium dark:text-slate-300">Original Text</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-xs dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
          <div className={`text-sm transition-all duration-300 dark:text-slate-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {isExpanded ? job.text : truncateText(job.text, 100)}
          </div>
        </div>

        {job.status === 'completed' && job.result && (
          <div className="mt-4 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-blue-100 dark:from-slate-700/50 dark:to-slate-800 dark:border-slate-600">
            <div className="flex items-center mb-3">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Analysis Results</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-700 dark:border-slate-600 shadow-sm">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-blue-600 mr-2 dark:text-blue-400" />
                  <p className="text-slate-700 font-bold text-sm dark:text-slate-200">Summary</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 dark:text-slate-300">{job.result.summary}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-700 dark:border-slate-600 shadow-sm">
                <div className="flex items-center mb-2">
                  <Smile className="h-4 w-4 text-green-600 mr-2 dark:text-green-400" />
                  <p className="text-slate-700 font-bold text-sm dark:text-slate-200">Sentiment</p>
                </div>
                <Badge
                  variant={
                    job.result.sentiment === 'positive' ? 'default' :
                    job.result.sentiment === 'negative' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {job.result.sentiment.charAt(0).toUpperCase() + job.result.sentiment.slice(1)}
                </Badge>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-700 dark:border-slate-600 shadow-sm">
                <div className="flex items-center mb-2">
                  <Key className="h-4 w-4 text-purple-600 mr-2 dark:text-purple-400" />
                  <p className="text-slate-700 font-bold text-sm dark:text-slate-200">Keywords</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.result.keywords.slice(0, 3).map((keyword, index) => {
                    const colors = ['bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
                                   'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
                                   'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200'];
                    const sizes = ['text-xs', 'text-sm', 'text-xs'];
                    return (
                      <Badge key={index} className={`${colors[index % colors.length]} ${sizes[index % sizes.length]} px-2 py-0.5 border-0`}>
                        {keyword}
                      </Badge>
                    );
                  })}
                  {job.result.keywords.length > 3 && (
                    <span className="text-xs text-slate-500 px-2 py-0.5 dark:text-slate-400">
                      +{job.result.keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {job.status === 'failed' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center">
              <p className="text-red-800 font-medium text-sm dark:text-red-300">Analysis failed. Please try again.</p>
            </div>
          </div>
        )}

        {job.status === 'pending' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400">⏳</div>
              <p className="text-yellow-800 font-medium text-sm dark:text-yellow-300">Analysis in progress...</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <AnalysisDetailsSheet job={job} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-100">Delete Job</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Are you sure you want to delete this analysis job? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
