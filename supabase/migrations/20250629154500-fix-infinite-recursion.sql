
-- Fix infinite recursion in projects RLS policies
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create simple, non-recursive policies for projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

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

-- Update the get_accessible_projects function to be more robust
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
  -- Only get user's own projects to avoid recursion
  SELECT 
    p.id,
    p.name,
    p.description,
    p.user_id,
    p.created_at,
    p.updated_at,
    'owner'::text as access_type
  FROM public.projects p
  WHERE p.user_id = $1;
$$;
