import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Play, History, Eye } from 'lucide-react';
import { usePromptScore } from '@/hooks/usePromptScore';
import { getScoreColorClasses } from '@/utils/promptScore';
import { useAnalysisContext } from '@/contexts/AnalysisContext';

interface PromptCardProps {
  prompt: any;
  isHighlighted?: boolean;
  onClick: (prompt: any) => void;
}

const PromptCard = ({ prompt, isHighlighted = false, onClick }: PromptCardProps) => {
  const { analysisCompletionCounter } = useAnalysisContext();
  const { scoreData } = usePromptScore(prompt.id, prompt.content, analysisCompletionCounter);
  
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

  return (
    <Card 
      id={`prompt-${prompt.id}`}
      className={`cursor-pointer hover:shadow-md transition-all duration-300 ${
        isHighlighted 
          ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 shadow-lg animate-slow-pulse' 
          : ''
      }`}
      onClick={() => onClick(prompt)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex-1">{prompt.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {isHighlighted && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <Eye className="h-3 w-3 mr-1" />
                Review This
              </Badge>
            )}
            <Badge className={`${getScoreColorClasses(scoreData.colorCode)} text-xs`}>
              {scoreData.score}/11
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
          {prompt.content}
        </p>
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(prompt.status)}>
            {getStatusLabel(prompt.status)}
          </Badge>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-3 w-3 text-gray-400" />
            <Play className="h-3 w-3 text-gray-400" />
            <History className="h-3 w-3 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
