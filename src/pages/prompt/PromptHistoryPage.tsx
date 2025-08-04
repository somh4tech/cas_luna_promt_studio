import { useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import VersionHistory from '@/components/VersionHistory';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptHistoryPage = () => {
  const { prompt } = useOutletContext<PromptOutletContext>();
  const queryClient = useQueryClient();

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
    queryClient.invalidateQueries({ queryKey: ['prompt', prompt.id] });
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <VersionHistory 
        prompt={prompt} 
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default PromptHistoryPage;