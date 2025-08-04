
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface MarkAsReviewedParams {
  invitationId: string;
  invitationToken: string;
}

export const useMarkAsReviewed = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId }: MarkAsReviewedParams) => {
      const { error } = await supabase
        .from('review_invitations')
        .update({ 
          reviewer_completed_at: new Date().toISOString(),
          status: 'accepted' // Ensure status is updated too
        })
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Marked as reviewed",
        description: "This prompt has been removed from your review list.",
      });
      
      // Invalidate the review prompts query to refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ['review-prompts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark prompt as reviewed. Please try again.",
        variant: "destructive",
      });
      console.error('Error marking as reviewed:', error);
    },
  });
};
