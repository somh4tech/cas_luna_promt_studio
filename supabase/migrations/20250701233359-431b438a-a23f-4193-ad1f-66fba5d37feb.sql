
-- Create a new function to get reviewable prompts for a user
CREATE OR REPLACE FUNCTION public.get_review_prompts(user_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  project_id uuid,
  project_name text,
  project_description text,
  invitation_id uuid,
  invitation_token uuid,
  invitation_message text,
  invitation_expires_at timestamp with time zone,
  invitation_status invitation_status
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT
    p.id,
    p.title,
    p.content,
    p.status,
    p.created_at,
    p.updated_at,
    p.project_id,
    proj.name as project_name,
    proj.description as project_description,
    ri.id as invitation_id,
    ri.invitation_token,
    ri.message as invitation_message,
    ri.expires_at as invitation_expires_at,
    ri.status as invitation_status
  FROM public.prompts p
  JOIN public.projects proj ON proj.id = p.project_id
  JOIN public.review_invitations ri ON ri.prompt_id = p.id
  WHERE (ri.reviewer_id = $1 OR LOWER(ri.reviewer_email) = LOWER((SELECT email FROM auth.users WHERE id = $1)))
  AND ri.status IN ('sent', 'accepted')
  AND ri.expires_at > now()
  AND proj.user_id != $1
  ORDER BY ri.created_at DESC;
$$;
