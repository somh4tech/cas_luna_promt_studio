-- Create triggers for automatic prompt version creation
CREATE OR REPLACE TRIGGER create_initial_prompt_version_trigger
  AFTER INSERT ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_prompt_version();

CREATE OR REPLACE TRIGGER create_prompt_version_trigger
  AFTER UPDATE ON public.prompts
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title OR OLD.content IS DISTINCT FROM NEW.content OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.create_prompt_version();

-- Migrate existing prompts to have initial versions
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