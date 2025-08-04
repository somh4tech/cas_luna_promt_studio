-- Add batch_id column to test_results table to group multi-model tests
ALTER TABLE public.test_results 
ADD COLUMN batch_id UUID NULL;

-- Add index for efficient batch queries
CREATE INDEX idx_test_results_batch_id ON public.test_results(batch_id);

-- Add index for efficient prompt + batch queries
CREATE INDEX idx_test_results_prompt_batch ON public.test_results(prompt_id, batch_id);