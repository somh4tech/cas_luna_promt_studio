
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle, Play } from 'lucide-react';
import PromptModal from '../PromptModal';

interface ReviewButtonProps {
  invitation: any;
  existingReview: any;
  prompt: any;
}

const ReviewButton = ({ invitation, existingReview, prompt }: ReviewButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isReviewCompleted = existingReview?.status === 'completed';

  const getButtonText = () => {
    if (isReviewCompleted) return 'View Your Review';
    if (existingReview) return 'Continue Review';
    return 'Start Review';
  };

  const getButtonIcon = () => {
    if (isReviewCompleted) return <CheckCircle className="h-4 w-4 mr-2" />;
    if (existingReview) return <MessageSquare className="h-4 w-4 mr-2" />;
    return <Play className="h-4 w-4 mr-2" />;
  };

  return (
    <>
      <div className="text-center py-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-gray-600">
            {isReviewCompleted 
              ? "You've completed your review for this prompt. Click below to view your feedback."
              : "Ready to review this prompt? Click below to open the review interface."
            }
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full"
            variant={isReviewCompleted ? "outline" : "default"}
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        </div>
      </div>

      <PromptModal
        prompt={prompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {}} // No update needed for reviewers
        defaultTab="reviews"
        isReviewerMode={true}
      />
    </>
  );
};

export default ReviewButton;
