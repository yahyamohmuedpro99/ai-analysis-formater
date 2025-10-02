export interface AnalysisJob {
  id: string;
  title: string;
  originalText: string;
  timestamp: Date;
  status: 'completed' | 'processing' | 'failed';
  results?: {
    sentiment?: {
      score: number;
      label: 'positive' | 'neutral' | 'negative';
      confidence: number;
    };
    keywords?: Array<{
      text: string;
      frequency: number;
      importance: number;
    }>;
    summary?: {
      text: string;
      compressionRatio: number;
    };
  };
}

export interface AnalysisOptions {
  sentiment: boolean;
  keywords: boolean;
  summary: boolean;
  language: string;
  depth: number;
}