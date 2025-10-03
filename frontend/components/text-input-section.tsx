"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Link as LinkIcon, Loader2, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { getRandomRSSArticle, scrapeUrl } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

interface TextInputSectionProps {
  onAnalyze: (text: string, mode: string) => void;
  isAnalyzing: boolean;
}

export function TextInputSection({ onAnalyze, isAnalyzing }: TextInputSectionProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"simple" | "deep">("simple");
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isLoadingRSS, setIsLoadingRSS] = useState(false);
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

  const handleTryExample = async () => {
    setIsLoadingRSS(true);
    try {
      const article = await getRandomRSSArticle();
      setText(article.text);
      toast({
        title: "Example Loaded",
        description: article.title || "Random article loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load example article",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRSS(false);
    }
  };

  const handleLoadUrl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingUrl(true);
    try {
      const result = await scrapeUrl(urlInput);
      setText(result.text);
      toast({
        title: "URL Loaded",
        description: `Extracted ${result.length} characters from the webpage`,
      });
      setUrlInput("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to scrape URL",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUrl(false);
    }
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

    if (text.length > 100000) {
      toast({
        title: "Error",
        description: "Text exceeds maximum length of 100,000 characters",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(text, mode);
  };

  const getCharacterCountColor = () => {
    if (text.length > 90000) return "text-red-600 dark:text-red-400";
    if (text.length > 75000) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="dark:text-slate-100">Text Input</CardTitle>
        <CardDescription className="dark:text-slate-400">Enter or upload text for AI analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <Label htmlFor="mode-toggle" className="text-sm font-medium dark:text-slate-200">
              {mode === "simple" ? "Simple Analysis" : "Deep Analysis"}
            </Label>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
              {mode === "simple"
                ? "Fast analysis with GPT-4o-mini - straightforward insights"
                : "Comprehensive analysis with GPT-4o - nuanced & detailed insights"}
            </p>
          </div>
          <Switch
            id="mode-toggle"
            checked={mode === "deep"}
            onCheckedChange={(checked) => setMode(checked ? "deep" : "simple")}
            className="ml-4"
          />
        </div>

        {/* Quick Load Options */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Globe className="h-4 w-4" />
            <span>Quick Load Options</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Load from URL */}
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-xs dark:text-slate-300 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Paste a URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadUrl}
                  disabled={isLoadingUrl || !urlInput.trim()}
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 shrink-0"
                >
                  {isLoadingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load"
                  )}
                </Button>
              </div>
            </div>

            {/* Random Example */}
            <div className="space-y-2">
              <Label className="text-xs dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Or try a random essay
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTryExample}
                disabled={isLoadingRSS}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {isLoadingRSS ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading essay...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Load Random Essay
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground dark:text-slate-400">Or enter text manually</span>
          </div>
        </div>

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
              {text.length}/100000
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
            {fileName ? `📄 ${fileName}` : "📁 Upload File"}
          </Button>
          <Button variant="outline" onClick={handleClear} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            🗑️ Clear
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
