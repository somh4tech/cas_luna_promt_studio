
-- Add analysis_type field to distinguish between quick and AI analysis
ALTER TABLE public.prompt_ai_analysis 
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'quick';

-- Update existing records to be marked as 'ai' type since they were likely from the AI analysis
UPDATE public.prompt_ai_analysis 
SET analysis_type = 'ai' 
WHERE analysis_type = 'quick';

-- Create index for better performance when querying latest analysis
CREATE INDEX IF NOT EXISTS idx_prompt_ai_analysis_prompt_created 
ON public.prompt_ai_analysis (prompt_id, created_at DESC);
