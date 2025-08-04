
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewPrompt {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  project_name: string;
  project_description: string;
  invitation_id: string;
  invitation_token: string;
  invitation_message: string;
  invitation_expires_at: string;
  invitation_status: string;
  reviewer_completed_at: string | null;
}

export const useReviewPrompts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviewPrompts = async (): Promise<ReviewPrompt[]> => {
    if (!user?.id) {
      console.log('useReviewPrompts: No user ID, returning empty array');
      return [];
    }

    console.log('useReviewPrompts: Fetching review prompts for user:', user.id);
    
    let timeoutId: NodeJS.Timeout;
    let fetchCompleted = false;

    try {
      console.log('useReviewPrompts: Calling review invitations query');
      
      // Set up timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (!fetchCompleted) {
            console.log('useReviewPrompts: Fetch timed out after 10 seconds');
            reject(new Error('Request timed out - please try again'));
          }
        }, 10000);
      });

      // Query with filtering for non-completed reviews
      const queryPromise = supabase
        .from('review_invitations')
        .select(`
          id,
          invitation_token,
          message,
          expires_at,
          status,
          reviewer_completed_at,
          prompts (
            id,
            title,
            content,
            status,
            created_at,
            updated_at,
            project_id,
            projects (
              name,
              description
            )
          )
        `)
        .or(`reviewer_id.eq.${user.id},reviewer_email.eq.${user.email}`)
        .in('status', ['sent', 'accepted'])
        .gt('expires_at', new Date().toISOString())
        .is('reviewer_completed_at', null) // Only fetch non-completed reviews
        .not('prompts.projects.user_id', 'eq', user.id);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      fetchCompleted = true;
      clearTimeout(timeoutId!);
      
      if (error) {
        console.error('useReviewPrompts: Error fetching review prompts:', error);
        throw new Error(error.message);
      }

      console.log('useReviewPrompts: Successfully fetched review invitations:', data?.length || 0, 'invitations');
      
      // Transform the data to match our ReviewPrompt interface
      const transformedPrompts: ReviewPrompt[] = data?.map((invitation: any) => ({
        id: invitation.prompts.id,
        title: invitation.prompts.title,
        content: invitation.prompts.content,
        status: invitation.prompts.status,
        created_at: invitation.prompts.created_at,
        updated_at: invitation.prompts.updated_at,
        project_id: invitation.prompts.project_id,
        project_name: invitation.prompts.projects.name,
        project_description: invitation.prompts.projects.description,
        invitation_id: invitation.id,
        invitation_token: invitation.invitation_token,
        invitation_message: invitation.message,
        invitation_expires_at: invitation.expires_at,
        invitation_status: invitation.status,
        reviewer_completed_at: invitation.reviewer_completed_at,
      })) || [];
      
      return transformedPrompts;

    } catch (err: any) {
      fetchCompleted = true;
      if (timeoutId!) clearTimeout(timeoutId);
      console.error('useReviewPrompts: Failed to fetch review prompts:', err);
      
      toast({
        title: "Error loading review prompts",
        description: "Unable to load prompts for review.",
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const {
    data: reviewPrompts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['review-prompts', user?.id],
    queryFn: fetchReviewPrompts,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const retryFetch = () => {
    console.log('useReviewPrompts: Retrying fetch');
    refetch();
  };

  return {
    reviewPrompts,
    isLoading,
    error: error?.message || null,
    retryFetch,
  };
};
