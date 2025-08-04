
-- Step 1: Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Public can view prompts via review invitation" ON public.prompts;
DROP POLICY IF EXISTS "Public can view basic project info for reviews" ON public.projects;

-- Step 2: Create security definer functions to safely check for active review invitations
-- This avoids circular dependencies in RLS policies

CREATE OR REPLACE FUNCTION public.has_active_review_invitation_for_prompt(prompt_id UUID)
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

CREATE OR REPLACE FUNCTION public.project_has_active_review_invitation_for_project(project_id UUID)
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

-- Step 3: Create non-recursive RLS policies using the security definer functions
-- Policy for prompts: Allow reading prompts that have active review invitations
CREATE POLICY "Public can view prompts with active review invitations" 
  ON public.prompts 
  FOR SELECT 
  USING (public.has_active_review_invitation_for_prompt(id));

-- Policy for projects: Allow reading projects that have prompts with active review invitations  
CREATE POLICY "Public can view projects with active review invitations" 
  ON public.projects 
  FOR SELECT 
  USING (public.project_has_active_review_invitation_for_project(id));
