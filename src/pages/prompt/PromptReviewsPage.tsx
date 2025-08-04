import { useOutletContext } from 'react-router-dom';
import ReviewSection from '@/components/review/ReviewSection';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptReviewsPage = () => {
  const { prompt, isReviewerMode } = useOutletContext<PromptOutletContext>();

  const handleRequestReview = () => {
    // This will be implemented with proper review flow
    console.log('Request review for prompt:', prompt.id);
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <ReviewSection
        promptId={prompt.id}
        isOpen={true}
        onRequestReview={handleRequestReview}
        isReviewerMode={isReviewerMode}
      />
    </div>
  );
};

export default PromptReviewsPage;