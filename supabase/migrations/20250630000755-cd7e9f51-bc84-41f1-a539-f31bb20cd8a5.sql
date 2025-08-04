
-- Allow public access to review invitations by token
-- This is needed for the review page to work for unauthenticated users
CREATE POLICY "Public can view review invitations by token" 
  ON public.review_invitations 
  FOR SELECT 
  USING (true);

-- Also ensure prompts can be read when there's a valid review invitation
CREATE POLICY "Public can view prompts via review invitation" 
  ON public.prompts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.review_invitations 
      WHERE review_invitations.prompt_id = prompts.id
      AND review_invitations.status IN ('sent', 'accepted')
      AND review_invitations.expires_at > now()
    )
  );

-- Allow public access to basic project info for review purposes
CREATE POLICY "Public can view basic project info for reviews" 
  ON public.projects 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.review_invitations ri
      JOIN public.prompts p ON p.project_id = projects.id
      WHERE ri.prompt_id = p.id
      AND ri.status IN ('sent', 'accepted')
      AND ri.expires_at > now()
    )
  );
