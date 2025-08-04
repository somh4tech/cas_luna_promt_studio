import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useInvitationAcceptance } from '@/hooks/useInvitationAcceptance';
import { supabase } from '@/integrations/supabase/client';

export type ProcessStep = 'verifying' | 'accepting' | 'preparing' | 'complete' | 'error' | 'timeout';

interface UseInvitationProcessingProps {
  invitationToken: string;
  onDebugInfo: (info: string) => void;
}

export const useInvitationProcessing = ({ invitationToken, onDebugInfo }: UseInvitationProcessingProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { acceptInvitation } = useInvitationAcceptance();
  const [currentStep, setCurrentStep] = useState<ProcessStep>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [invitationEmail, setInvitationEmail] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleTimeout = () => {
    console.error('InvitationProcessing: Process timed out after 15 seconds');
    setCurrentStep('timeout');
    setError('The invitation acceptance process is taking longer than expected. Please try again or contact support.');
  };

  const handleLogout = async () => {
    try {
      onDebugInfo('Logging out user...');
      await signOut();
      navigate(`/auth?invitation=${invitationToken}`);
    } catch (error) {
      console.error('Error during logout:', error);
      onDebugInfo('Error during logout, redirecting anyway...');
      navigate(`/auth?invitation=${invitationToken}`);
    }
  };

  const handleInvitationAcceptance = async (attempt = 1) => {
    if (!user || !invitationToken) {
      onDebugInfo('Missing user or invitation token');
      return;
    }

    try {
      onDebugInfo(`Starting invitation acceptance (attempt ${attempt})`);
      setCurrentStep('verifying');
      setError(null);
      setErrorType(null);

      // Step 1: Verify invitation details
      onDebugInfo('Fetching invitation details...');
      const { data: invitationData, error: invitationError } = await supabase
        .from('review_invitations')
        .select(`
          *,
          prompts!inner (
            id,
            project_id,
            title
          )
        `)
        .eq('invitation_token', invitationToken)
        .single();

      if (invitationError || !invitationData) {
        onDebugInfo(`Failed to fetch invitation: ${invitationError?.message || 'No data'}`);
        throw new Error('Failed to fetch invitation details');
      }

      onDebugInfo(`Found invitation for prompt: ${invitationData.prompts.title}`);
      setProjectId(invitationData.prompts.project_id);
      setPromptId(invitationData.prompts.id);

      // Step 2: Accept invitation
      setCurrentStep('accepting');
      onDebugInfo('Accepting invitation...');
      
      const result = await acceptInvitation(invitationToken, user.id);
      
      if (!result.success) {
        onDebugInfo(`Invitation acceptance failed: ${result.error}`);
        
        if (result.errorType === 'email_mismatch') {
          setErrorType('email_mismatch');
          setUserEmail(result.userEmail || null);
          setInvitationEmail(result.invitationEmail || null);
        }
        
        throw new Error(result.error || 'Failed to accept invitation');
      }

      onDebugInfo('Invitation accepted successfully');
      
      // Step 3: Prepare access
      setCurrentStep('preparing');
      onDebugInfo('Preparing project access...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('complete');
      onDebugInfo('Process completed successfully');
      
      setTimeout(() => {
        onDebugInfo('Redirecting to project...');
        navigate(`/project/${invitationData.prompts.project_id}?invitation=${invitationToken}&prompt=${invitationData.prompts.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('InvitationProcessing: Error during acceptance process:', err);
      onDebugInfo(`Error: ${err.message}`);
      setCurrentStep('error');
      setError(err.message || 'An unexpected error occurred during invitation acceptance');
    }
  };

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    onDebugInfo(`Manual retry initiated (attempt ${newRetryCount + 1})`);
    handleInvitationAcceptance(newRetryCount + 1);
  };

  const handleGoToProject = () => {
    if (projectId && promptId) {
      onDebugInfo('Manual navigation to project');
      navigate(`/project/${projectId}?invitation=${invitationToken}&prompt=${promptId}`);
    } else {
      onDebugInfo('Manual navigation to dashboard');
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (!user || !invitationToken) {
      onDebugInfo('Waiting for user authentication...');
      return;
    }

    onDebugInfo(`User authenticated: ${user.email}`);
    
    const timeoutId = setTimeout(handleTimeout, 15000);
    handleInvitationAcceptance(1);
    
    return () => clearTimeout(timeoutId);
  }, [user, invitationToken]);

  return {
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
  };
};
