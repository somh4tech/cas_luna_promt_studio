-- Create missing profiles for users who have prompts but no profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email) as full_name
FROM auth.users au
WHERE au.id IN (
  SELECT DISTINCT p.user_id 
  FROM public.prompts p 
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles prof WHERE prof.id = p.user_id
  )
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles prof WHERE prof.id = au.id
);

-- Now migrate remaining prompts to have initial versions
INSERT INTO public.prompt_versions (
  prompt_id,
  version_number,
  title,
  content,
  status,
  created_by,
  change_summary,
  is_current,
  created_at
)
SELECT 
  p.id,
  p.version,
  p.title,
  p.content,
  p.status,
  p.user_id,
  'Initial version (migrated)',
  true,
  p.created_at
FROM public.prompts p
WHERE NOT EXISTS (
  SELECT 1 FROM public.prompt_versions pv 
  WHERE pv.prompt_id = p.id
);