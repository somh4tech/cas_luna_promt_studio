
-- First, let's check and fix the RLS policies for the projects table
-- Add proper RLS policies for projects table

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create comprehensive RLS policies for projects

-- Policy to allow users to view their own projects OR projects where they have review invitations
CREATE POLICY "Users can view accessible projects" 
  ON public.projects 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.review_invitations ri
      JOIN public.prompts p ON ri.prompt_id = p.id
      WHERE p.project_id = projects.id 
      AND (ri.reviewer_id = auth.uid() OR ri.reviewer_email = auth.email())
      AND ri.status IN ('sent', 'accepted')
      AND ri.expires_at > now()
    )
  );

-- Policy for creating projects (only own projects)
CREATE POLICY "Users can create their own projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating projects (only own projects)
CREATE POLICY "Users can update their own projects" 
  ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for deleting projects (only own projects)
CREATE POLICY "Users can delete their own projects" 
  ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to get accessible projects for a user
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
  -- User's own projects
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
  
  -- Projects with review invitations
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
