
-- Enhance the test_results table to support versioned prompt testing with LLMs
ALTER TABLE public.test_results 
ADD COLUMN prompt_version_id uuid REFERENCES public.prompt_versions(id),
ADD COLUMN model_name text,
ADD COLUMN model_version text,
ADD COLUMN temperature real DEFAULT 0.7,
ADD COLUMN max_tokens integer DEFAULT 1000,
ADD COLUMN cost_estimate decimal(10,6),
ADD COLUMN response_time_ms integer,
ADD COLUMN tokens_used jsonb, -- {"prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150}
ADD COLUMN parameters jsonb, -- Store model-specific parameters
ADD COLUMN error_message text,
ADD COLUMN status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'));

-- Add indexes for better query performance
CREATE INDEX idx_test_results_prompt_version ON public.test_results(prompt_version_id);
CREATE INDEX idx_test_results_model ON public.test_results(model_name, model_version);
CREATE INDEX idx_test_results_status ON public.test_results(status);
CREATE INDEX idx_test_results_created_at ON public.test_results(created_at DESC);

-- Update the existing test_results to have proper defaults
UPDATE public.test_results 
SET model_name = 'mock-model', 
    model_version = '1.0',
    status = 'completed'
WHERE model_name IS NULL;

-- Create a function to get the current prompt version for testing
CREATE OR REPLACE FUNCTION get_current_prompt_version(p_prompt_id uuid)
RETURNS TABLE(
  version_id uuid,
  version_number integer,
  title text,
  content text,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    pv.id,
    pv.version_number,
    pv.title,
    pv.content,
    pv.status
  FROM public.prompt_versions pv
  WHERE pv.prompt_id = p_prompt_id 
    AND pv.is_current = true
  LIMIT 1;
$$;

-- Create a function to get test analytics
CREATE OR REPLACE FUNCTION get_test_analytics(p_prompt_id uuid)
RETURNS TABLE(
  total_tests bigint,
  avg_response_time numeric,
  total_cost numeric,
  models_used bigint,
  success_rate numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) as total_tests,
    AVG(response_time_ms) as avg_response_time,
    SUM(cost_estimate) as total_cost,
    COUNT(DISTINCT model_name) as models_used,
    (COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric * 100) as success_rate
  FROM public.test_results
  WHERE prompt_id = p_prompt_id;
$$;
