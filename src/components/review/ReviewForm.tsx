
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMarkAsReviewed } from '@/hooks/useMarkAsReviewed';

interface ReviewFormProps {
  invitation: any;
  existingReview: any;
  user: any;
}

const ReviewForm = ({ invitation, existingReview, user }: ReviewFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const markAsReviewedMutation = useMarkAsReviewed();
  const [feedback, setFeedback] = useState('');
  const [suggestedChanges, setSuggestedChanges] = useState('');

  const isReviewCompleted = existingReview?.status === 'completed';

  // Submit review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ feedback, suggestedChanges, markComplete }: { 
      feedback: string; 
      suggestedChanges: string; 
      markComplete: boolean;
    }) => {
      if (!user?.id || !invitation?.prompt_id) throw new Error('Missing required data');
      
      // Submit the review
      const { error: reviewError } = await supabase
        .from('prompt_reviews')
        .upsert({
          prompt_id: invitation.prompt_id,
          reviewer_id: user.id,
          invitation_id: invitation.id,
          status: 'completed',
          feedback: feedback.trim() || null,
          suggested_changes: suggestedChanges.trim() || null,
          completed_at: new Date().toISOString(),
        });
      
      if (reviewError) throw reviewError;

      // If marking complete, also update the invitation
      if (markComplete) {
        const { error: invitationError } = await supabase
          .from('review_invitations')
          .update({ 
            reviewer_completed_at: new Date().toISOString(),
            status: 'accepted'
          })
          .eq('id', invitation.id);
        
        if (invitationError) throw invitationError;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.markComplete ? "Review completed" : "Review submitted",
        description: variables.markComplete 
          ? "Thank you for your feedback! This prompt has been marked as reviewed."
          : "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ['prompt-review', invitation?.prompt_id, user?.id] });
      if (variables.markComplete) {
        queryClient.invalidateQueries({ queryKey: ['review-prompts'] });
      }
    },
  });

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setFeedback(existingReview.feedback || '');
      setSuggestedChanges(existingReview.suggested_changes || '');
    }
  }, [existingReview]);

  const handleSubmitReview = (markComplete: boolean = false) => {
    submitReviewMutation.mutate({ feedback, suggestedChanges, markComplete });
  };

  const handleMarkAsReviewed = () => {
    markAsReviewedMutation.mutate({
      invitationId: invitation.id,
      invitationToken: invitation.invitation_token,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="feedback">General Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts on this prompt. What works well? What could be improved?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              disabled={isReviewCompleted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested-changes">Suggested Changes (optional)</Label>
            <Textarea
              id="suggested-changes"
              placeholder="Suggest specific changes or improvements to the prompt..."
              value={suggestedChanges}
              onChange={(e) => setSuggestedChanges(e.target.value)}
              rows={4}
              disabled={isReviewCompleted}
            />
          </div>

          {!isReviewCompleted && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button"
                onClick={() => handleSubmitReview(false)}
                disabled={submitReviewMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review Only'}
              </Button>
              <Button 
                type="button"
                onClick={() => handleSubmitReview(true)}
                disabled={submitReviewMutation.isPending}
                className="flex-1"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit & Mark Complete'}
              </Button>
            </div>
          )}

          {!isReviewCompleted && (existingReview || feedback.trim() || suggestedChanges.trim()) && (
            <div className="pt-2 border-t">
              <Button 
                type="button"
                onClick={handleMarkAsReviewed}
                disabled={markAsReviewedMutation.isPending}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                {markAsReviewedMutation.isPending ? 'Marking...' : 'Mark as Reviewed (No Additional Feedback)'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
