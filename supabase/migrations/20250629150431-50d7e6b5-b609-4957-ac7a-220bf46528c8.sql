
-- Step 1: Clean up conflicting policies and fix infinite recursion
-- Drop the problematic policies that are causing circular dependencies
DROP POLICY IF EXISTS "Allow reading projects with active review invitations" ON public.projects;
DROP POLICY IF EXISTS "Allow reading prompts with active review invitations" ON public.prompts;
DROP POLICY IF EXISTS "Allow reading invitations by token" ON public.review_invitations;

-- Drop the functions that are no longer needed and causing issues
DROP FUNCTION IF EXISTS public.project_has_active_review_invitation(uuid);
DROP FUNCTION IF EXISTS public.has_active_review_invitation(uuid);

-- Drop the existing get_accessible_projects function to recreate it properly
DROP FUNCTION IF EXISTS public.get_accessible_projects(uuid);

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view prompts in their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts in their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts in their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts in their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view invitations they created or received" ON public.review_invitations;

-- Create a simplified, non-recursive RLS policy for projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for other operations on projects
CREATE POLICY "Users can create their own projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a simplified get_accessible_projects function that avoids RLS recursion
CREATE OR REPLACE FUNCTION public.get_accessible_projects(user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  access_type text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Get user's own projects directly without triggering RLS
  SELECT 
    p.id,
    p.name,
    p.description,
    p.user_id,
    p.created_at,
    p.updated_at,
    'owner'::text as access_type
  FROM public.projects p
  WHERE p.user_id = $1
  
  UNION
  
  -- Get projects where user has review invitations (avoiding RLS recursion)
  SELECT DISTINCT
    p.id,
    p.name,
    p.description,
    p.user_id,
    p.created_at,
    p.updated_at,
    'reviewer'::text as access_type
  FROM public.projects p
  JOIN public.prompts pr ON pr.project_id = p.id
  JOIN public.review_invitations ri ON ri.prompt_id = pr.id
  WHERE (ri.reviewer_id = $1 OR ri.reviewer_email = (SELECT email FROM auth.users WHERE id = $1))
  AND ri.status IN ('sent', 'accepted')
  AND ri.expires_at > now()
  AND p.user_id != $1;
$$;

-- Create basic RLS policies for prompts
CREATE POLICY "Users can view prompts in their projects" 
  ON public.prompts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = prompts.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prompts in their projects" 
  ON public.prompts 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = prompts.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update prompts in their projects" 
  ON public.prompts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = prompts.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prompts in their projects" 
  ON public.prompts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = prompts.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create basic RLS policy for review invitations
CREATE POLICY "Users can view invitations they created or received" 
  ON public.review_invitations 
  FOR SELECT 
  USING (
    auth.uid() = inviter_id OR 
    auth.uid() = reviewer_id OR 
    auth.email() = reviewer_email
  );
