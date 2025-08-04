
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ResizableTextarea } from '@/components/ui/resizable-textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { sendCommentNotification, getActiveReviewers } from '@/utils/emailService';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  prompt_id: string;
  user_id: string;
}

interface CommentSectionProps {
  promptId: string;
  promptTitle: string;
  isOpen: boolean;
}

const CommentSection = ({ promptId, promptTitle, isOpen }: CommentSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', promptId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  // Combine server comments with optimistic comments
  const allComments = [...comments, ...optimisticComments];

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: comment,
          prompt_id: promptId,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, commentContent) => {
      // Clear optimistic comment
      setOptimisticComments([]);
      
      // Invalidate and refetch comments
      await queryClient.invalidateQueries({ queryKey: ['comments', promptId] });
      
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });

      // Send email notifications to active reviewers
      try {
        const activeReviewers = await getActiveReviewers(promptId, user?.id);
        const commenterName = user?.email || 'Anonymous';

        for (const reviewer of activeReviewers) {
          const reviewerEmail = reviewer.profiles?.email || reviewer.reviewer_email;
          if (reviewerEmail) {
            await sendCommentNotification({
              to: reviewerEmail,
              promptTitle,
              commentContent,
              commenterName,
              promptId,
            });
          }
        }

        if (activeReviewers.length > 0) {
          console.log(`Comment notifications sent to ${activeReviewers.length} reviewers`);
        }
      } catch (error) {
        console.error('Failed to send comment notifications:', error);
      }
    },
    onError: () => {
      // Clear optimistic comment on error
      setOptimisticComments([]);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      // Add optimistic comment immediately
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        created_at: new Date().toISOString(),
        prompt_id: promptId,
        user_id: user.id,
      };
      
      setOptimisticComments([optimisticComment]);
      addCommentMutation.mutate(newComment);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {allComments.map((comment) => (
          <Card key={comment.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {comment.user_id === user?.id ? 'You' : 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{comment.content}</p>
            </CardContent>
          </Card>
        ))}
        {allComments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
      <form onSubmit={handleAddComment} className="space-y-2">
        <ResizableTextarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          minRows={3}
          maxRows={8}
        />
        <Button type="submit" disabled={addCommentMutation.isPending}>
          Post Comment
        </Button>
      </form>
    </div>
  );
};

export default CommentSection;
