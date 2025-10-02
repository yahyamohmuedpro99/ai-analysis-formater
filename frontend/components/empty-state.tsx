import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onTryExample: () => void;
}

export function EmptyState({ onTryExample }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4 dark:text-slate-400" />
      <h3 className="text-xl font-bold mb-2 dark:text-slate-100">No analyses yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md dark:text-slate-400">
        Submit your first text for AI analysis to get started. Our powerful engine will provide sentiment analysis, keyword extraction, and intelligent summaries.
      </p>
      <Button onClick={onTryExample}>
        Try Example Analysis
      </Button>
    </div>
  );
}