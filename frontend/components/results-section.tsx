"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RotateCw, CheckCircle, Clock, XCircle } from "lucide-react";
import JobCard from "@/components/JobCard";

interface ResultsSectionProps {
  jobs: any[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteJob: (jobId: string) => void;
  currentPage?: number;
  totalJobs?: number;
  onPageChange?: (page: number) => void;
  title?: string;
}

export function ResultsSection({ jobs, loading, onRefresh, onDeleteJob, currentPage = 1, totalJobs = 0, onPageChange, title = "Your Analysis Jobs" }: ResultsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      // For type filter, we would check job.result types but for now we'll skip
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  return (
    <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="dark:text-slate-100">{title}</CardTitle>
            <CardDescription className="dark:text-slate-400">{totalJobs > 0 ? `${totalJobs} jobs found` : `${jobs.length} jobs found`}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-slate-400" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
            <Button onClick={onRefresh} variant="outline" disabled={loading} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Refreshing...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge
            variant={statusFilter === "all" ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              statusFilter === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant={statusFilter === "completed" ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              statusFilter === "completed"
                ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                : "dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
          <Badge
            variant={statusFilter === "processing" ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              statusFilter === "processing"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md"
                : "dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setStatusFilter("processing")}
          >
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
          <Badge
            variant={statusFilter === "failed" ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              statusFilter === "failed"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                : "dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setStatusFilter("failed")}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-muted-foreground dark:text-slate-400">Loading your analysis jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 dark:bg-slate-700">
              <Search className="h-8 w-8 text-muted-foreground dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-1 dark:text-slate-100">No analysis jobs found</h3>
            <p className="text-muted-foreground mb-4 dark:text-slate-400">
              {searchQuery ? "No jobs match your search." : "Submit your first text for analysis."}
            </p>
            {!searchQuery && (
              <Button>Try Example Analysis</Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading && filteredJobs.length === 0 ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-6 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </Card>
              ))
            ) : (
              filteredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <JobCard job={job} onDelete={onDeleteJob} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalJobs > 5 && onPageChange && (
          <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="dark:border-slate-600 dark:text-slate-300"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground dark:text-slate-400">
              Page {currentPage} of {Math.ceil(totalJobs / 5)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalJobs / 5)}
              className="dark:border-slate-600 dark:text-slate-300"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
