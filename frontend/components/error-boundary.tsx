"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Error caught by boundary:", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 dark:text-slate-400">
            We're sorry, but something went wrong. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}