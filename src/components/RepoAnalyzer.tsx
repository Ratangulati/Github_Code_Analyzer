import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Github, Code2, FileCode2 } from 'lucide-react';
import RepoInfo from './RepoInfo';
import CodeAnalysis from './CodeAnalysis';
import { Navbar } from './Navbar';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const RepoAnalyzer = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<any>(null);
  const { toast } = useToast();

  const extractRepoInfo = (url: string) => {
    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(regex);
      if (!match) throw new Error('Invalid GitHub URL');
      return { owner: match[1], repo: match[2] };
    } catch (error) {
      throw new Error('Please enter a valid GitHub repository URL');
    }
  };

  const fetchWithAuth = async (url: string) => {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers });
    
    if (response.status === 403) {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      const resetTime = rateLimitReset 
        ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
        : 'unknown time';
      
      throw new Error(
        `GitHub API rate limit exceeded. ${
          !GITHUB_TOKEN 
            ? 'Please add a GitHub token to increase the rate limit.' 
            : `Rate limit will reset at ${resetTime}`
        }`
      );
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  };

  const analyzeRepo = async () => {
    try {
      setLoading(true);
      const { owner, repo } = extractRepoInfo(repoUrl);
      
      const [repoResponse, contentsResponse] = await Promise.all([
        fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}`),
        fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`)
      ]);
      
      setRepoData({ ...repoResponse, tree: contentsResponse.tree });
      toast({
        title: "Repository analyzed successfully",
        description: "You can now explore the repository structure and analysis.",
      });
    } catch (error: any) {
      toast({
        title: "Error analyzing repository",
        description: error.message,
        variant: "destructive",
      });
      setRepoData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
  {!repoData ? (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Base Grid */}
        <div
          className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(to_right,#e5e7eb_1px,transparent_1px)] bg-[size:36px_36px]"
          style={{ opacity: 0.4 }}
        />
      </div>
      <Navbar />
      {/* Content Container */}
      <div className="container mx-auto px-6 py-8 max-w-6xl rounded-lg z-10">
        <h1 className="max-w-4xl mx-auto text-5xl font-bold tracking-tight text-center flex flex-col gap-2">
          <span>Stop Wrestling With</span>
          <span className="flex items-center justify-center">
            New Codebases
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center mt-4">
          Let AI help you! Analyze any GitHub repository from structure to code, understand any codebase instantly.
        </p>

        {/* <Card className="p-4 md:p-8 max-w-2xl mx-auto bg-secondary/50"> */}
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 items-center w-full p-4">
            <div className="relative w-3/6">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-500">
                <Github className="h-6 w-6" />
              </span>
              <Input
                placeholder="Enter GitHub repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 rounded-full w-full h-12 pl-12 pr-4 text-lg bg-background"
              />
            </div>
              <Button className='w-48' onClick={analyzeRepo} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 rounded-lg bg-background">
                <Github className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold">Repository Info</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed information about the repository
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-background">
                <Code2 className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold">Code Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze the repository's file structure
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-background">
                <FileCode2 className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold">Code Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered insights for each file
                </p>
              </div>
            </div>
            {!GITHUB_TOKEN && (
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-sm">
                ⚠️ No GitHub token detected. API requests may be rate
                limited. Add your token to increase the limit.
              </div>
            )}
          </div>
        {/* </Card> */}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto my-auto px-6 py-8 max-w-6xl bg-white">
        <Button
          variant="outline"
          onClick={() => setRepoData(null)}
          className="mb-4"
        >
          ← Back to Search
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RepoInfo data={repoData} />
          <CodeAnalysis repoData={repoData} />
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default RepoAnalyzer;
