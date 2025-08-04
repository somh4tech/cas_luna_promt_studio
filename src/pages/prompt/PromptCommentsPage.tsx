import { useOutletContext } from 'react-router-dom';
import CommentSection from '@/components/CommentSection';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptCommentsPage = () => {
  const { prompt } = useOutletContext<PromptOutletContext>();

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <CommentSection 
        promptId={prompt.id} 
        promptTitle={prompt.title}
        isOpen={true} 
      />
    </div>
  );
};

export default PromptCommentsPage;