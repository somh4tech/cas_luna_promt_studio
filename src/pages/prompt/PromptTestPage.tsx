import { useOutletContext } from 'react-router-dom';
import TestSection from '@/components/TestSection';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptTestPage = () => {
  const { prompt } = useOutletContext<PromptOutletContext>();

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <TestSection 
        promptId={prompt.id} 
        isOpen={true}
        promptContent={prompt.content}
        promptTitle={prompt.title}
        promptVersion={prompt.version}
      />
    </div>
  );
};

export default PromptTestPage;