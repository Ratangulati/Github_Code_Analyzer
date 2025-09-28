import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import FileTree from './FileTree';
import { analyzeFileContent, testGeminiModelAvailability } from '@/lib/analysisUtils';

interface CodeAnalysisProps {
  repoData: any;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const CodeAnalysis: React.FC<CodeAnalysisProps> = ({ repoData }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ [key: string]: string }>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { toast } = useToast();

  const decodeBase64 = (base64String: string) => {
    try {
      // Remove any whitespace and ensure proper padding
      const cleaned = base64String.replace(/\s/g, '');
      return atob(cleaned);
    } catch (error) {
      throw new Error('Invalid file content encoding');
    }
  };

  const analyzeFile = async (path: string, url: string) => {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not defined");
      toast({
        title: "Configuration Error",
        description: "GEMINI_API_KEY is not configured. Please check your .env file.",
        variant: "destructive",
      });
      return;
    }

    // Test model availability on first use
    if (availableModels.length === 0) {
      try {
        const models = await testGeminiModelAvailability(GEMINI_API_KEY);
        setAvailableModels(models);
        if (models.length === 0) {
          toast({
            title: "No Gemini Models Available",
            description: "No Gemini models are available with your API key. Please check your API key and permissions.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        toast({
          title: "API Key Error",
          description: "Failed to test Gemini API. Please check your API key.",
          variant: "destructive",
        });
        return;
      }
    }

    if (analyzing) {
      toast({
        title: "Analysis in Progress",
        description: "Please wait for the current analysis to complete",
        variant: "default",
      });
      return;
    }

    try {
      setAnalyzing(true);
      
      // Use the same authentication as the main GitHub API calls
      const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };
      
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }
      
      const contentResponse = await fetch(url, { headers });
      
      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch file: ${contentResponse.statusText}`);
      }
      
      const contentData = await contentResponse.json();
      if (!contentData.content) {
        throw new Error('No content found in the response');
      }

      const decodedContent = decodeBase64(contentData.content);
      const analysis = await analyzeFileContent(GEMINI_API_KEY, path, decodedContent);
      
      setAnalysis(prev => ({
        ...prev,
        [path]: analysis
      }));

      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${path}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze the file",
        variant: "destructive",
      });
      
      setAnalysis(prev => {
        const newAnalysis = { ...prev };
        delete newAnalysis[path];
        return newAnalysis;
      });
    } finally {
      setAnalyzing(false);
    }
  };

  

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {!GEMINI_API_KEY && (
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-sm">
            ⚠️ No Gemini API key detected. File analysis will not work.
            <br />
            <strong>To fix this:</strong>
            <br />
            1. Create a <code>.env</code> file in the project root
            <br />
            2. Add: <code>VITE_GEMINI_API_KEY=your_api_key_here</code>
            <br />
            3. Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>
          </div>
        )}
        {GEMINI_API_KEY && availableModels.length > 0 && (
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-sm">
            ✅ Gemini API connected successfully!
            <br />
            Available models: <code>{availableModels.join(', ')}</code>
          </div>
        )}
        <div className="space-y-2">
          {analyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing file...
            </div>
          )}
          {repoData && (
            <FileTree
              tree={repoData.tree}
              analysisResults={analysis}
              onAnalyzeFile={analyzeFile}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default CodeAnalysis;