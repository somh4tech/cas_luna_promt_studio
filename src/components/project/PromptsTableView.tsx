import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Star, MessageSquare, Play, History, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePromptScore } from '@/hooks/usePromptScore';
import { getScoreColorClasses } from '@/utils/promptScore';
import { useAnalysisContext } from '@/contexts/AnalysisContext';

interface PromptsTableViewProps {
  prompts: any[];
  highlightPromptId: string | null;
  hasInteractedWithHighlight: boolean;
  invitationToken: string | null;
  onPromptClick: (prompt: any) => void;
}

const PromptRowScore = ({ prompt }: { prompt: any }) => {
  const { analysisCompletionCounter } = useAnalysisContext();
  const { scoreData } = usePromptScore(prompt.id, prompt.content, analysisCompletionCounter);
  
  return (
    <Badge className={`${getScoreColorClasses(scoreData.colorCode)} text-xs`}>
      {scoreData.score}/11
    </Badge>
  );
};

const PromptsTableView = ({
  prompts,
  highlightPromptId,
  hasInteractedWithHighlight,
  invitationToken,
  onPromptClick
}: PromptsTableViewProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'in_review': return 'In Review'; 
      case 'in_production': return 'In Production';
      default: return status;
    }
  };

  const isHighlightedPrompt = (promptId: string) => {
    return invitationToken && highlightPromptId === promptId && !hasInteractedWithHighlight;
  };

  const toggleFavorite = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(promptId)) {
      newFavorites.delete(promptId);
    } else {
      newFavorites.add(promptId);
    }
    setFavorites(newFavorites);
  };

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => {
              const isHighlighted = isHighlightedPrompt(prompt.id);
              
              return (
                <TableRow
                  key={prompt.id}
                  id={`prompt-${prompt.id}`}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isHighlighted 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : ''
                  }`}
                  onClick={() => onPromptClick(prompt)}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleFavorite(prompt.id, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          favorites.has(prompt.id) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-xs">{prompt.title}</span>
                        {isHighlighted && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            <Eye className="h-3 w-3 mr-1" />
                            Review This
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 truncate max-w-md">
                        {prompt.content}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(prompt.status)}>
                      {getStatusLabel(prompt.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <PromptRowScore prompt={prompt} />
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {new Date(prompt.updated_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <History className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onPromptClick(prompt);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PromptsTableView;
