-- Add language support to prompt AI analysis
ALTER TABLE public.prompt_ai_analysis 
ADD COLUMN original_language TEXT DEFAULT 'en',
ADD COLUMN detected_language TEXT,
ADD COLUMN language_confidence REAL;