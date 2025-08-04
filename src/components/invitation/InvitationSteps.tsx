
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { ProcessStep } from '@/hooks/useInvitationProcessing';

interface InvitationStepsProps {
  currentStep: ProcessStep;
  isNewUser: boolean;
}

const InvitationSteps = ({ currentStep, isNewUser }: InvitationStepsProps) => {
  const getStepIcon = (step: ProcessStep) => {
    switch (step) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
      case 'timeout':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStepText = (step: ProcessStep) => {
    switch (step) {
      case 'verifying':
        return 'Verifying invitation...';
      case 'accepting':
        return 'Accepting invitation...';
      case 'preparing':
        return 'Preparing project access...';
      case 'complete':
        return 'Ready to review!';
      case 'error':
        return 'Something went wrong';
      case 'timeout':
        return 'Process timed out';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center text-green-700">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span>{isNewUser ? 'Account ready' : 'Signed in successfully'}</span>
      </div>
      <div className="flex items-center justify-center text-green-700">
        {getStepIcon(currentStep)}
        <span className="ml-2">{getStepText(currentStep)}</span>
      </div>
    </div>
  );
};

export default InvitationSteps;
