
-- Update the get_accessible_projects function to use case-insensitive email matching
CREATE OR REPLACE FUNCTION public.get_accessible_projects(user_id uuid)
RETURNS TABLE(id uuid, name text, description text, user_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, access_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
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
  
  -- Get projects where user has review invitations (with case-insensitive email matching)
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
  WHERE (ri.reviewer_id = $1 OR LOWER(ri.reviewer_email) = LOWER((SELECT email FROM auth.users WHERE id = $1)))
  AND ri.status IN ('sent', 'accepted')
  AND ri.expires_at > now()
  AND p.user_id != $1;
$function$
