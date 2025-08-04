
-- Drop the existing INSERT policy for comments
DROP POLICY IF EXISTS "Users can add comments on accessible prompts" ON public.comments;

-- Create a new INSERT policy that allows both project owners and reviewers to add comments
CREATE POLICY "Users can add comments on accessible prompts" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (
    -- Allow project owners to comment on their prompts
    EXISTS (
      SELECT 1
      FROM prompts
      JOIN projects ON prompts.project_id = projects.id
      WHERE prompts.id = comments.prompt_id 
      AND projects.user_id = auth.uid()
    )
    OR
    -- Allow reviewers with active invitations to comment on prompts they're reviewing
    EXISTS (
      SELECT 1
      FROM review_invitations ri
      WHERE ri.prompt_id = comments.prompt_id
      AND (ri.reviewer_id = auth.uid() OR ri.reviewer_email = auth.email())
      AND ri.status IN ('sent', 'accepted')
      AND ri.expires_at > now()
    )
  );
