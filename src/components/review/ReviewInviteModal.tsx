
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendReviewInvitation } from '@/utils/emailService';

interface ReviewInviteModalProps {
  prompt: any;
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent?: () => void;
}

const ReviewInviteModal = ({ prompt, isOpen, onClose, onInvitationSent }: ReviewInviteModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const inviteReviewerMutation = useMutation({
    mutationFn: async ({ email, message }: { email: string; message?: string }) => {
      console.log('inviteReviewerMutation starting for email:', email);
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('review_invitations')
        .insert({
          prompt_id: prompt.id,
          inviter_id: user.data.user.id,
          reviewer_email: email,
          message: message || null,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send email using the centralized email service
      await sendReviewInvitation({
        to: email,
        promptTitle: prompt.title,
        promptContent: prompt.content,
        inviterName: user.data.user.email || 'A colleague',
        message: message,
        invitationToken: invitation.invitation_token,
      });

      console.log('inviteReviewerMutation completed successfully');
      return invitation;
    },
    onSuccess: () => {
      console.log('inviteReviewerMutation onSuccess callback triggered');
      toast({
        title: "Review invitation sent",
        description: "Your colleague will receive an email with the review request.",
      });
      setEmail('');
      setMessage('');
      
      // Invalidate both the review invitations and accessible projects queries
      queryClient.invalidateQueries({ queryKey: ['review-invitations', prompt.id] });
      queryClient.invalidateQueries({ queryKey: ['accessible-projects'] });
      
      // Call the callback to handle status change in parent component
      if (onInvitationSent) {
        console.log('Calling onInvitationSent callback');
        onInvitationSent();
      } else {
        console.log('No onInvitationSent callback, just closing modal');
        onClose();
      }
    },
    onError: (error: any) => {
      console.error('Error sending review invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "An error occurred while sending the invitation.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with email:', email);
    if (email.trim()) {
      inviteReviewerMutation.mutate({ email: email.trim(), message: message.trim() });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Request Review
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewer-email">Reviewer Email</Label>
            <Input
              id="reviewer-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitation-message">Message (optional)</Label>
            <Textarea
              id="invitation-message"
              placeholder="Hey! Could you review this prompt for me? I'd love your feedback on..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              <strong>"{prompt.title}"</strong>
            </p>
            <p className="text-xs text-gray-500 line-clamp-3">
              {prompt.content}
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteReviewerMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {inviteReviewerMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewInviteModal;
