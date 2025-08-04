
-- This SQL will be run separately to create the caching table
CREATE TABLE IF NOT EXISTS public.prompt_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  analysis_version TEXT NOT NULL DEFAULT 'v1',
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_prompt_ai_analysis_hash_version 
ON public.prompt_ai_analysis(content_hash, analysis_version);

CREATE INDEX IF NOT EXISTS idx_prompt_ai_analysis_prompt_id 
ON public.prompt_ai_analysis(prompt_id);

-- Enable RLS
ALTER TABLE public.prompt_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own prompt analyses
CREATE POLICY "Users can view their own prompt analyses" 
  ON public.prompt_ai_analysis 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = prompt_ai_analysis.prompt_id 
      AND prompts.user_id = auth.uid()
    )
  );
