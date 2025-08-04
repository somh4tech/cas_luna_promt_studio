
-- Create prompt_versions table to store historical snapshots
CREATE TABLE public.prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_summary TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false
);

-- Add foreign key constraints
ALTER TABLE public.prompt_versions 
ADD CONSTRAINT prompt_versions_prompt_id_fkey 
FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;

ALTER TABLE public.prompt_versions 
ADD CONSTRAINT prompt_versions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add indexes for efficient queries
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_version_number ON public.prompt_versions(prompt_id, version_number DESC);
CREATE UNIQUE INDEX idx_prompt_versions_current ON public.prompt_versions(prompt_id) WHERE is_current = true;

-- Enable RLS
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view versions of their prompts" 
  ON public.prompt_versions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their prompts" 
  ON public.prompt_versions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Function to create a new version when prompt is updated
CREATE OR REPLACE FUNCTION public.create_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all existing versions as not current
  UPDATE public.prompt_versions 
  SET is_current = false 
  WHERE prompt_id = NEW.id;
  
  -- Create new version entry
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
    CASE 
      WHEN OLD.title != NEW.title THEN 'Title updated'
      WHEN OLD.status != NEW.status THEN 'Status changed to ' || NEW.status
      ELSE 'Content updated'
    END,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create versions
CREATE TRIGGER create_prompt_version_trigger
  AFTER UPDATE ON public.prompts
  FOR EACH ROW
  WHEN (OLD.version != NEW.version)
  EXECUTE FUNCTION public.create_prompt_version();

-- Create initial versions for existing prompts
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
  id,
  version,
  title,
  content,
  status,
  user_id,
  'Initial version',
  true
FROM public.prompts;
