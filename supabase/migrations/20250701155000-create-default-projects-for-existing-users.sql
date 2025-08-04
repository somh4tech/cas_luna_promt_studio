
-- Create default projects for all existing users who don't have any projects
INSERT INTO public.projects (user_id, name, description)
SELECT 
  p.id,
  'My Personal Prompts',
  'A space for your personal prompt experiments and ideas'
FROM public.profiles p
LEFT JOIN public.projects pr ON p.id = pr.user_id
WHERE pr.user_id IS NULL;
