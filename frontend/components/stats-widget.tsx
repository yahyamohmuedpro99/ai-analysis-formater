"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, CheckCircle, Clock } from "lucide-react";

interface StatsWidgetProps {
  jobs: any[];
}

export function StatsWidget({ jobs }: StatsWidgetProps) {
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const totalAnalyzed = jobs.length;
  
  // Calculate average sentiment
  const completedWithResults = jobs.filter(job => job.status === 'completed' && job.result);
  const avgPositive = completedWithResults.length > 0
    ? Math.round(completedWithResults.reduce((acc, job) => acc + (job.result?.positiveScore || 0), 0) / completedWithResults.length)
    : 0;

  const stats = [
    {
      title: "Total Analyses",
      value: totalAnalyzed,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Completed",
      value: completedJobs,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Processing",
      value: pendingJobs,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      title: "Avg. Positive",
      value: `${avgPositive}%`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">{stat.title}</p>
                <p className="text-2xl font-bold mt-1 dark:text-slate-100">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
