"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TextInputSectionProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export function TextInputSection({ onAnalyze, isAnalyzing }: TextInputSectionProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setText("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTryExample = () => {
    const exampleText = "Artificial intelligence is transforming the world in unprecedented ways. From healthcare to transportation, AI is revolutionizing industries and improving efficiency. However, it also raises important ethical questions about privacy, bias, and the future of work. As we continue to develop these technologies, it's crucial that we consider both the benefits and potential risks.";
    setText(exampleText);
  };

  const handleAnalyze = () => {
    if (text.trim().length === 0) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 20000) {
      toast({
        title: "Error",
        description: "Text exceeds maximum length of 20,000 characters",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(text);
  };

  const getCharacterCountColor = () => {
    if (text.length > 18000) return "text-red-600 dark:text-red-400";
    if (text.length > 15000) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="dark:text-slate-100">Text Input</CardTitle>
        <CardDescription className="dark:text-slate-400">Enter or upload text for AI analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="dark:text-slate-300">Enter your text</Label>
          <Textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Enter or paste your text here for AI-powered analysis..."
            className="min-h-[250px] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 glow-effect"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground dark:text-slate-400">
              AI-powered analysis includes sentiment, keywords, and summaries
            </div>
            <Badge variant="outline" className={`${getCharacterCountColor()} text-lg font-semibold px-3 py-1`}>
              {text.length}/20000
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.csv"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {fileName ? `File: ${fileName}` : "Upload File"}
          </Button>
          <Button variant="outline" onClick={handleClear} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            Clear
          </Button>
          <Button variant="outline" onClick={handleTryExample} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            Try Example
          </Button>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || text.trim().length === 0}
          className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-700 dark:to-blue-700 transition-all duration-200 ${
            !isAnalyzing && text.trim().length > 0 ? 'animate-pulse-slow glow-effect' : ''
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Text
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
