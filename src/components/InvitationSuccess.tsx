
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useInvitationProcessing } from '@/hooks/useInvitationProcessing';
import InvitationSteps from '@/components/invitation/InvitationSteps';
import InvitationError from '@/components/invitation/InvitationError';
import InvitationActions from '@/components/invitation/InvitationActions';
// import InvitationDebug from '@/components/invitation/InvitationDebug'; // Removed debug component

interface InvitationSuccessProps {
  invitationToken: string;
  promptTitle: string;
  isNewUser: boolean;
}

const InvitationSuccess = ({ invitationToken, promptTitle, isNewUser }: InvitationSuccessProps) => {
  // Debug functionality removed for production
  const addDebugInfo = (info: string) => {
    // Production logging only for errors
    if (info.includes('error') || info.includes('Error')) {
      console.error('InvitationSuccess:', info);
    }
  };

  const {
    currentStep,
    error,
    errorType,
    userEmail,
    invitationEmail,
    projectId,
    promptId,
    handleLogout,
    handleRetry,
    handleGoToProject,
  } = useInvitationProcessing({
    invitationToken,
    onDebugInfo: addDebugInfo,
  });

  const showError = currentStep === 'error' || currentStep === 'timeout';
  const showSuccess = currentStep === 'complete';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className={`max-w-md ${showError ? 'border-red-200' : 'border-green-200 bg-green-50'}`}>
        <CardHeader className="text-center">
          <CardTitle className={`${showError ? 'text-red-800' : 'text-green-800'} flex items-center justify-center`}>
            {showError ? (
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            ) : showSuccess ? (
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            ) : (
              <Loader2 className="h-6 w-6 mr-2 text-green-600 animate-spin" />
            )}
            {isNewUser ? 'Account Created!' : 'Welcome Back!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <InvitationSteps currentStep={currentStep} isNewUser={isNewUser} />

          {error && (
            <InvitationError
              error={error}
              errorType={errorType}
              userEmail={userEmail}
              invitationEmail={invitationEmail}
            />
          )}

          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium">
              You're invited to review:
            </p>
            <p className="text-sm text-gray-900 font-semibold">"{promptTitle}"</p>
          </div>

          <InvitationActions
            currentStep={currentStep}
            errorType={errorType}
            projectId={projectId}
            onLogout={handleLogout}
            onRetry={handleRetry}
            onGoToProject={handleGoToProject}
          />

          {showSuccess && !showError && (
            <p className="text-xs text-gray-600">
              Taking you to the project in a moment...
            </p>
          )}

          {/* <InvitationDebug debugInfo={debugInfo} /> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSuccess;
