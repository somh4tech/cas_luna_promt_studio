
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  template: 'review-invitation' | 'welcome' | 'notification' | 'comment-notification' | 'edit-notification';
  to: string;
  data: Record<string, any>;
}

export const sendEmail = async (emailData: EmailTemplate) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: emailData,
  });

  if (error) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return data;
};

// Helper function specifically for review invitations
export const sendReviewInvitation = async ({
  to,
  promptTitle,
  promptContent,
  inviterName,
  message,
  invitationToken,
}: {
  to: string;
  promptTitle: string;
  promptContent: string;
  inviterName: string;
  message?: string;
  invitationToken: string;
}) => {
  return sendEmail({
    template: 'review-invitation',
    to,
    data: {
      promptTitle,
      promptContent,
      inviterName,
      message,
      invitationToken,
      reviewUrl: `${window.location.origin}/review/${invitationToken}`,
    },
  });
};

// Helper function for comment notifications
export const sendCommentNotification = async ({
  to,
  promptTitle,
  commentContent,
  commenterName,
  promptId,
}: {
  to: string;
  promptTitle: string;
  commentContent: string;
  commenterName: string;
  promptId: string;
}) => {
  return sendEmail({
    template: 'comment-notification',
    to,
    data: {
      promptTitle,
      commentContent,
      commenterName,
      promptUrl: `${window.location.origin}/project/${promptId}`,
    },
  });
};

// Helper function for edit notifications
export const sendEditNotification = async ({
  to,
  promptTitle,
  editorName,
  changeType,
  promptId,
}: {
  to: string;
  promptTitle: string;
  editorName: string;
  changeType: string;
  promptId: string;
}) => {
  return sendEmail({
    template: 'edit-notification',
    to,
    data: {
      promptTitle,
      editorName,
      changeType,
      promptUrl: `${window.location.origin}/project/${promptId}`,
    },
  });
};

// Helper function to get active reviewers for a prompt
export const getActiveReviewers = async (promptId: string, excludeUserId?: string) => {
  const { data: reviewers, error } = await supabase
    .from('review_invitations')
    .select(`
      reviewer_email,
      reviewer_id,
      profiles:reviewer_id (
        full_name,
        email
      )
    `)
    .eq('prompt_id', promptId)
    .in('status', ['sent', 'accepted'])
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching active reviewers:', error);
    return [];
  }

  // Filter out the user who made the change to avoid self-notifications
  return reviewers?.filter(reviewer => 
    reviewer.reviewer_id !== excludeUserId && 
    (reviewer.profiles?.email || reviewer.reviewer_email)
  ) || [];
};
