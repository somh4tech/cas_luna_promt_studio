import { useOutletContext } from 'react-router-dom';
import PromptAnalysisSection from '@/components/analysis/PromptAnalysisSection';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptAnalyzePage = () => {
  const { prompt, isOwner } = useOutletContext<PromptOutletContext>();

  const handlePromptContentUpdate = (newContent: string) => {
    // This will be handled by the analysis section internally
    console.log('Content updated:', newContent);
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <PromptAnalysisSection
        promptContent={prompt.content}
        promptTitle={prompt.title}
        promptId={prompt.id}
        isOpen={true}
        onPromptUpdate={isOwner ? handlePromptContentUpdate : undefined}
      />
    </div>
  );
};

export default PromptAnalyzePage;