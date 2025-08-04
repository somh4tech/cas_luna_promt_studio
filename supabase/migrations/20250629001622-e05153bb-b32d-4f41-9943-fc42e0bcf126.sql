
-- First, let's ensure all existing prompts have corresponding entries in prompt_versions
INSERT INTO public.prompt_versions (
  prompt_id,
  version_number,
  title,
  content,
  status,
  created_by,
  change_summary,
  is_current
)
SELECT 
  p.id,
  p.version,
  p.title,
  p.content,
  p.status,
  p.user_id,
  'Initial version (migrated)',
  true
FROM public.prompts p
WHERE NOT EXISTS (
  SELECT 1 FROM public.prompt_versions pv 
  WHERE pv.prompt_id = p.id AND pv.is_current = true
);

-- Also create a trigger to automatically create version entries when new prompts are created
CREATE OR REPLACE FUNCTION public.create_initial_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Create initial version entry for new prompts
  INSERT INTO public.prompt_versions (
    prompt_id,
    version_number,
    title,
    content,
    status,
    created_by,
    change_summary,
    is_current
  ) VALUES (
    NEW.id,
    NEW.version,
    NEW.title,
    NEW.content,
    NEW.status,
    NEW.user_id,
    'Initial version',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new prompt creation
DROP TRIGGER IF EXISTS create_initial_prompt_version_trigger ON public.prompts;
CREATE TRIGGER create_initial_prompt_version_trigger
  AFTER INSERT ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_prompt_version();
