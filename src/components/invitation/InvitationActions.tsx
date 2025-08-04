
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { ProcessStep } from '@/hooks/useInvitationProcessing';

interface InvitationActionsProps {
  currentStep: ProcessStep;
  errorType: string | null;
  projectId: string | null;
  onLogout: () => void;
  onRetry: () => void;
  onGoToProject: () => void;
}

const InvitationActions = ({ 
  currentStep, 
  errorType, 
  projectId, 
  onLogout, 
  onRetry, 
  onGoToProject 
}: InvitationActionsProps) => {
  const showError = currentStep === 'error' || currentStep === 'timeout';
  const showSuccess = currentStep === 'complete';
  const showManualOptions = showError || (showSuccess && projectId);
  const isEmailMismatch = errorType === 'email_mismatch';

  if (!showManualOptions) {
    return null;
  }

  return (
    <div className="space-y-2">
      {isEmailMismatch && (
        <Button onClick={onLogout} className="w-full" variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Log out and try again
        </Button>
      )}
      
      {showError && !isEmailMismatch && (
        <Button onClick={onRetry} className="w-full" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
      
      <Button onClick={onGoToProject} className="w-full">
        {projectId ? 'Go to Project & Review' : 'Go to Dashboard'}
      </Button>
    </div>
  );
};

export default InvitationActions;
