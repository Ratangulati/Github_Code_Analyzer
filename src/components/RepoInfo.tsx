import React from 'react';
import { Card } from '@/components/ui/card';
import { Star, GitFork, Eye, Calendar } from 'lucide-react';

interface RepoInfoProps {
  data: any;
}

const RepoInfo: React.FC<RepoInfoProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{data.name}</h2>
      <p className="text-muted-foreground mb-6">{data.description}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>{data.stargazers_count} stars</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-5 w-5 text-blue-500" />
          <span>{data.forks_count} forks</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-green-500" />
          <span>{data.watchers_count} watchers</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          <span>Created: {new Date(data.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-secondary rounded-ls">
        <h3 className="font-semibold mb-2">Repository Details</h3>
        <ul className="space-y-2">
          <li>Default Branch: {data.default_branch}</li>
          <li>Language: {data.language}</li>
          <li>Open Issues: {data.open_issues_count}</li>
          <li>License: {data.license?.name || 'Not specified'}</li>
        </ul>
      </div>
    </Card>
  );
};

export default RepoInfo;