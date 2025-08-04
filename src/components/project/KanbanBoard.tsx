
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import PromptCard from './PromptCard';

interface KanbanBoardProps {
  prompts: any[];
  canCreatePrompts: boolean;
  invitationToken: string | null;
  highlightPromptId: string | null;
  hasInteractedWithHighlight: boolean;
  onPromptClick: (prompt: any) => void;
  onCreatePromptClick: () => void;
}

const KanbanBoard = ({
  prompts,
  canCreatePrompts,
  invitationToken,
  highlightPromptId,
  hasInteractedWithHighlight,
  onPromptClick,
  onCreatePromptClick
}: KanbanBoardProps) => {
  const groupedPrompts = {
    in_progress: prompts?.filter(p => p.status === 'in_progress') || [],
    in_review: prompts?.filter(p => p.status === 'in_review') || [],
    in_production: prompts?.filter(p => p.status === 'in_production') || [],
  };

  const isHighlightedPrompt = (promptId: string) => {
    return invitationToken && highlightPromptId === promptId && !hasInteractedWithHighlight;
  };

  if (prompts?.length === 0 && canCreatePrompts) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts yet</h3>
        <p className="text-gray-600 mb-4">Create your first prompt to get started</p>
        <Button onClick={onCreatePromptClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Prompt
        </Button>
      </div>
    );
  }

  if (prompts?.length === 0 && !canCreatePrompts) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts in this project yet</h3>
        <p className="text-gray-600">You have reviewer access to this project. Prompts will appear here when the project owner adds them.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* In Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
          <Badge variant="secondary">{groupedPrompts.in_progress.length}</Badge>
        </div>
        <div className="space-y-3">
          {groupedPrompts.in_progress.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              isHighlighted={isHighlightedPrompt(prompt.id)}
              onClick={onPromptClick}
            />
          ))}
        </div>
      </div>

      {/* In Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">In Review</h2>
          <Badge variant="secondary">{groupedPrompts.in_review.length}</Badge>
        </div>
        <div className="space-y-3">
          {groupedPrompts.in_review.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              isHighlighted={isHighlightedPrompt(prompt.id)}
              onClick={onPromptClick}
            />
          ))}
        </div>
      </div>

      {/* In Production */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">In Production</h2>
          <Badge variant="secondary">{groupedPrompts.in_production.length}</Badge>
        </div>
        <div className="space-y-3">
          {groupedPrompts.in_production.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              isHighlighted={isHighlightedPrompt(prompt.id)}
              onClick={onPromptClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
