
-- Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Allow reading prompts with active review invitations" ON public.prompts;
DROP POLICY IF EXISTS "Allow reading projects with active review invitations" ON public.projects;
DROP POLICY IF EXISTS "Allow reading invitations by token" ON public.review_invitations;

-- Create security definer functions to safely check for active review invitations
-- This avoids circular dependencies in RLS policies

CREATE OR REPLACE FUNCTION public.has_active_review_invitation(prompt_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.review_invitations 
    WHERE review_invitations.prompt_id = $1
    AND review_invitations.status IN ('sent', 'accepted')
    AND review_invitations.expires_at > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.project_has_active_review_invitation(project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.prompts p
    JOIN public.review_invitations ri ON ri.prompt_id = p.id
    WHERE p.project_id = $1
    AND ri.status IN ('sent', 'accepted')
    AND ri.expires_at > now()
  );
$$;

-- Create simplified RLS policies using the security definer functions
-- Policy for prompts: Allow reading prompts that have active review invitations
CREATE POLICY "Allow reading prompts with active review invitations" 
  ON public.prompts 
  FOR SELECT 
  USING (public.has_active_review_invitation(id));

-- Policy for projects: Allow reading projects that have prompts with active review invitations  
CREATE POLICY "Allow reading projects with active review invitations" 
  ON public.projects 
  FOR SELECT 
  USING (public.project_has_active_review_invitation(id));

-- Policy for review_invitations: Allow reading invitations by token (for unauthenticated users)
CREATE POLICY "Allow reading invitations by token" 
  ON public.review_invitations 
  FOR SELECT 
  USING (true);
