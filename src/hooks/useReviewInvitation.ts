
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReviewInvitation = (token: string | undefined) => {
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<any>(null);
  const [prompt, setPrompt] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitation = async (isRetry = false) => {
    if (!token) {
      console.log('useReviewInvitation: No token provided');
      setIsLoading(false);
      setError('Invalid invitation token');
      return;
    }

    console.log(`useReviewInvitation: ${isRetry ? 'Retrying' : 'Starting'} to fetch invitation for token:`, token);
    setIsLoading(true);
    setError(null);
    
    let timeoutId: NodeJS.Timeout;
    let fetchCompleted = false;

    try {
      console.log('useReviewInvitation: Fetching invitation data');
      
      // Set up timeout - only trigger if fetch hasn't completed
      timeoutId = setTimeout(() => {
        if (!fetchCompleted) {
          console.log('useReviewInvitation: Fetch timed out after 10 seconds');
          setError('Request timed out - please try again');
          setIsLoading(false);
        }
      }, 10000);

      // Step 1: Fetch basic invitation data first
      const { data: invitationData, error: invitationError } = await supabase
        .from('review_invitations')
        .select('*')
        .eq('invitation_token', token)
        .single();
      
      if (invitationError) {
        console.error('useReviewInvitation: Error fetching invitation:', invitationError);
        fetchCompleted = true;
        clearTimeout(timeoutId);
        setError('Invalid or expired invitation link');
        setIsLoading(false);
        return;
      }

      console.log('useReviewInvitation: Successfully fetched invitation:', invitationData);
      setInvitation(invitationData);

      // Step 2: Fetch prompt data separately
      if (invitationData.prompt_id) {
        const { data: promptData, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', invitationData.prompt_id)
          .single();
        
        if (!promptError && promptData) {
          console.log('useReviewInvitation: Successfully fetched prompt:', promptData);
          setPrompt(promptData);
          
          // Step 3: Fetch project data separately
          if (promptData.project_id) {
            const { data: projectData, error: projectError } = await supabase
              .from('projects')
              .select('id, name')
              .eq('id', promptData.project_id)
              .single();
            
            if (!projectError && projectData) {
              console.log('useReviewInvitation: Successfully fetched project:', projectData);
              setProject(projectData);
            } else {
              console.warn('useReviewInvitation: Could not fetch project data:', projectError);
            }
          }
        } else {
          console.warn('useReviewInvitation: Could not fetch prompt data:', promptError);
        }
      }

      // Mark fetch as completed to prevent timeout error
      fetchCompleted = true;
      clearTimeout(timeoutId);
      setError(null);
      
    } catch (err: any) {
      fetchCompleted = true;
      clearTimeout(timeoutId!);
      console.error('useReviewInvitation: Failed to fetch invitation:', err);
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error loading review invitation",
        description: "Unable to load the review invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (fetchCompleted) {
        console.log('useReviewInvitation: Fetch completed, setting loading to false');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, [token, toast]);

  const retryFetch = () => {
    console.log('useReviewInvitation: Retrying fetch');
    fetchInvitation(true);
  };

  return {
    invitation,
    prompt,
    project,
    isLoading,
    error,
    retryFetch,
  };
};
