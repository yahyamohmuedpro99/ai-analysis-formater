"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Download } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisDetailsSheetProps {
  job: any;
}

export function AnalysisDetailsSheet({ job }: AnalysisDetailsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(job, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `analysis-${job.id || 'export'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.text('Analysis Report', margin, yPosition);
    yPosition += 15;

    // Basic info
    pdf.setFontSize(12);
    pdf.text(`Status: ${job.status}`, margin, yPosition);
    yPosition += 10;
    pdf.text(`Created: ${formatDate(job.createdAt)}`, margin, yPosition);
    yPosition += 10;
    if (job.completedAt) {
      pdf.text(`Completed: ${formatDate(job.completedAt)}`, margin, yPosition);
      yPosition += 10;
    }
    pdf.text(`Text Length: ${job.text.length} characters`, margin, yPosition);
    yPosition += 20;

    // Original text
    pdf.setFontSize(14);
    pdf.text('Original Text:', margin, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);

    const textLines = pdf.splitTextToSize(job.text, pageWidth - 2 * margin);
    for (const line of textLines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 10;

    // Results
    if (job.result) {
      // Sentiment
      if (job.result.sentiment) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(14);
        pdf.text('Sentiment Analysis:', margin, yPosition);
        yPosition += 10;
        pdf.setFontSize(12);
        pdf.text(`Overall Sentiment: ${job.result.sentiment}`, margin, yPosition);
        yPosition += 10;
        pdf.text(`Positive: ${job.result.positiveScore}%`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Neutral: ${job.result.neutralScore}%`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Negative: ${job.result.negativeScore}%`, margin, yPosition);
        yPosition += 15;
      }

      // Keywords
      if (job.result.keywords && job.result.keywords.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(14);
        pdf.text('Keywords:', margin, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const keywordsText = job.result.keywords.join(', ');
        const keywordLines = pdf.splitTextToSize(keywordsText, pageWidth - 2 * margin);
        for (const line of keywordLines) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 10;
      }

      // Summary
      if (job.result.summary) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(14);
        pdf.text('Summary:', margin, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const summaryLines = pdf.splitTextToSize(job.result.summary, pageWidth - 2 * margin);
        for (const line of summaryLines) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        }
      }
    }

    pdf.save(`analysis-${job.id || 'report'}.pdf`);
  };

  if (!job) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" size="sm">
          View Details
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto bg-background">
        <SheetHeader>
          <SheetTitle>Analysis Details</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <p className="font-medium capitalize">{job.status}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                <p className="font-medium">{formatDate(job.createdAt)}</p>
              </div>
              {job.completedAt && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Completed</h3>
                  <p className="font-medium">{formatDate(job.completedAt)}</p>
                </div>
              )}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground">Text Length</h3>
                <p className="font-medium">{job.text.length} characters</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Original Text</h3>
              <div className="max-h-40 overflow-y-auto text-sm bg-muted p-3 rounded">
                {job.text}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment" className="mt-6 space-y-4">
            {job.result?.sentiment ? (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {job.result.sentiment === 'positive' ? '😊' : 
                     job.result.sentiment === 'negative' ? '😠' : '😐'}
                  </div>
                  <h3 className="text-xl font-bold capitalize">{job.result.sentiment} Sentiment</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Positive</span>
                    <span>{job.result.positiveScore}%</span>
                  </div>
                  <Progress value={job.result.positiveScore} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Neutral</span>
                    <span>{job.result.neutralScore}%</span>
                  </div>
                  <Progress value={job.result.neutralScore} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Negative</span>
                    <span>{job.result.negativeScore}%</span>
                  </div>
                  <Progress value={job.result.negativeScore} className="h-2" />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sentiment analysis not available for this job.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="keywords" className="mt-6">
            {job.result?.keywords ? (
              <div className="flex flex-wrap gap-2">
                {job.result.keywords.map((keyword: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-base py-2 px-3 cursor-pointer"
                    onClick={() => copyToClipboard(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Keyword extraction not available for this job.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="mt-6 space-y-4">
            {job.result?.summary ? (
              <>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Generated Summary</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(job.result.summary)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm">{job.result.summary}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Compression: {Math.round((1 - job.result.summary.length / job.text.length) * 100)}%
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Summary not available for this job.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
