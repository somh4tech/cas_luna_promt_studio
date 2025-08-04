
-- Drop the existing SELECT policy for comments
DROP POLICY IF EXISTS "Users can view comments on accessible prompts" ON public.comments;

-- Create a new SELECT policy that allows both project owners and reviewers to view comments
CREATE POLICY "Users can view comments on accessible prompts" 
  ON public.comments 
  FOR SELECT 
  USING (
    -- Allow project owners to view comments on their prompts
    EXISTS (
      SELECT 1
      FROM prompts
      JOIN projects ON prompts.project_id = projects.id
      WHERE prompts.id = comments.prompt_id 
      AND projects.user_id = auth.uid()
    )
    OR
    -- Allow reviewers with active invitations to view comments on prompts they're reviewing
    EXISTS (
      SELECT 1
      FROM review_invitations ri
      WHERE ri.prompt_id = comments.prompt_id
      AND (ri.reviewer_id = auth.uid() OR ri.reviewer_email = auth.email())
      AND ri.status IN ('sent', 'accepted')
      AND ri.expires_at > now()
    )
  );
