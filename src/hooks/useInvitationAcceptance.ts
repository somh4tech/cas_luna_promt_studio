
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInvitationAcceptance = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const acceptInvitation = async (invitationToken: string, userId: string) => {
    setIsAccepting(true);
    
    try {
      console.log('useInvitationAcceptance: Starting invitation acceptance process');
      console.log('useInvitationAcceptance: Token:', invitationToken);
      console.log('useInvitationAcceptance: User ID:', userId);

      // Add retry logic for database operations
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          // First, get the invitation details
          console.log(`useInvitationAcceptance: Fetching invitation (attempt ${attempt + 1})`);
          const { data: invitation, error: invitationError } = await supabase
            .from('review_invitations')
            .select('*')
            .eq('invitation_token', invitationToken)
            .single();

          if (invitationError) {
            console.error('useInvitationAcceptance: Error fetching invitation:', invitationError);
            if (attempt === maxRetries - 1) {
              return { success: false, error: 'Invalid invitation token or invitation not found' };
            }
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }

          console.log('useInvitationAcceptance: Found invitation:', invitation);

          // Check if invitation is already accepted by this user
          if (invitation.reviewer_id === userId) {
            console.log('useInvitationAcceptance: Invitation already accepted by this user');
            return { success: true, message: 'Invitation already accepted' };
          }

          // Get user's email for case-insensitive matching
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user?.email) {
            console.error('useInvitationAcceptance: Error getting user data:', userError);
            return { success: false, error: 'Unable to verify user email' };
          }

          const userEmail = userData.user.email.toLowerCase();
          const invitationEmail = invitation.reviewer_email.toLowerCase();

          console.log('useInvitationAcceptance: Comparing emails (case-insensitive)');
          console.log('useInvitationAcceptance: User email:', userEmail);
          console.log('useInvitationAcceptance: Invitation email:', invitationEmail);

          // Check if the user's email matches the invitation email (case-insensitive)
          if (userEmail !== invitationEmail) {
            console.error('useInvitationAcceptance: Email mismatch');
            return { 
              success: false, 
              error: `You're logged in as ${userData.user.email}, but this invitation was sent to ${invitation.reviewer_email}. Would you like to log out and sign in with the correct email address?`,
              errorType: 'email_mismatch',
              userEmail: userData.user.email,
              invitationEmail: invitation.reviewer_email
            };
          }

          // Check if invitation is expired
          if (new Date(invitation.expires_at) < new Date()) {
            console.error('useInvitationAcceptance: Invitation expired');
            return { success: false, error: 'This invitation has expired' };
          }

          // Update the invitation to mark it as accepted
          console.log('useInvitationAcceptance: Updating invitation status to accepted');
          const { error: updateError } = await supabase
            .from('review_invitations')
            .update({
              status: 'accepted',
              reviewer_id: userId,
              updated_at: new Date().toISOString()
            })
            .eq('invitation_token', invitationToken);

          if (updateError) {
            console.error('useInvitationAcceptance: Error updating invitation:', updateError);
            if (attempt === maxRetries - 1) {
              return { success: false, error: 'Failed to accept invitation - database update failed' };
            }
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }

          console.log('useInvitationAcceptance: Successfully accepted invitation');
          return { success: true, message: 'Invitation accepted successfully' };

        } catch (retryError: any) {
          console.error(`useInvitationAcceptance: Attempt ${attempt + 1} failed:`, retryError);
          if (attempt === maxRetries - 1) {
            throw retryError;
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      return { success: false, error: 'Failed to accept invitation after multiple attempts' };

    } catch (error: any) {
      console.error('useInvitationAcceptance: Unexpected error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during invitation acceptance' };
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    acceptInvitation,
    isAccepting,
  };
};
