
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Check } from 'lucide-react';
import { useMarkAsReviewed } from '@/hooks/useMarkAsReviewed';

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    status: string;
    project_name: string;
    invitation_token: string;
    invitation_message?: string;
    created_at: string;
    invitation_id: string;
  };
  onPromptClick: (invitationToken: string) => void;
}

const PromptCard = ({ prompt, onPromptClick }: PromptCardProps) => {
  const markAsReviewedMutation = useMarkAsReviewed();

  const handleCardClick = () => {
    onPromptClick(prompt.invitation_token);
  };

  const handleMarkAsReviewed = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    markAsReviewedMutation.mutate({
      invitationId: prompt.invitation_id,
      invitationToken: prompt.invitation_token,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_production': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />
            <CardTitle className="text-lg truncate">{prompt.title}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              Review Request
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm text-gray-600">
            From project: {prompt.project_name}
          </CardDescription>
          <Badge className={getStatusColor(prompt.status)}>
            {prompt.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-700 line-clamp-3">
            {prompt.content.slice(0, 150)}...
          </div>
          {prompt.invitation_message && (
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <p className="text-xs font-medium text-purple-800 mb-1">Review Request:</p>
              <p className="text-sm text-purple-700 italic">"{prompt.invitation_message}"</p>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>Requested {new Date(prompt.created_at).toLocaleDateString()}</span>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>Click to review</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800"
          onClick={handleMarkAsReviewed}
          disabled={markAsReviewedMutation.isPending}
        >
          <Check className="h-4 w-4 mr-2" />
          {markAsReviewedMutation.isPending ? 'Marking...' : 'Mark as Reviewed'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;
