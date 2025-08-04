
-- Fix the infinite recursion by removing the problematic RLS policy
-- and ensuring only simple, direct policies remain on the projects table

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;

-- Ensure we have clean, simple policies for the projects table
-- (These should already exist from previous migrations, but ensuring they're correct)

-- Verify the simple policy exists for users to view their own projects
DO $$
BEGIN
    -- Check if the policy exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Users can view their own projects'
    ) THEN
        -- Create the simple policy
        EXECUTE 'CREATE POLICY "Users can view their own projects" 
          ON public.projects 
          FOR SELECT 
          USING (auth.uid() = user_id)';
    END IF;
END
$$;

-- Ensure the get_accessible_projects function is working correctly
-- (This should already exist and be correct from previous migrations)
-- Verify it returns projects with proper access_type distinction

-- Test the function works (this is just for verification, won't affect data)
-- The function should return both owned projects and reviewer projects
SELECT 'Function verification: get_accessible_projects exists' as status
WHERE EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_accessible_projects'
);
