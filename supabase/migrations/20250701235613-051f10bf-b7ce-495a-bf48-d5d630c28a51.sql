
-- Add reviewer_completed_at field to review_invitations table
ALTER TABLE public.review_invitations 
ADD COLUMN reviewer_completed_at TIMESTAMP WITH TIME ZONE NULL;

-- Update the existing RLS policy to allow reviewers to update their completion status
DROP POLICY IF EXISTS "Users can update their own invitations or accept invitations" ON public.review_invitations;

CREATE POLICY "Users can update their own invitations or accept invitations" 
ON public.review_invitations 
FOR UPDATE 
USING ((auth.uid() = inviter_id) OR (auth.uid() = reviewer_id) OR (auth.email() = reviewer_email));
