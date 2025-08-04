-- Create AI cost analytics functions for the dashboard

-- Function to get overall cost metrics
CREATE OR REPLACE FUNCTION public.get_ai_cost_overview()
RETURNS TABLE(
  total_cost_all_time numeric,
  total_cost_this_month numeric,
  total_cost_this_week numeric,
  total_tests_all_time bigint,
  total_tests_this_month bigint,
  average_cost_per_test numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(cost_estimate), 0) as total_cost_all_time,
    COALESCE(SUM(cost_estimate) FILTER (WHERE created_at >= date_trunc('month', now())), 0) as total_cost_this_month,
    COALESCE(SUM(cost_estimate) FILTER (WHERE created_at >= date_trunc('week', now())), 0) as total_cost_this_week,
    COUNT(*) as total_tests_all_time,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as total_tests_this_month,
    COALESCE(AVG(cost_estimate), 0) as average_cost_per_test
  FROM public.test_results
  WHERE status = 'completed';
$$;

-- Function to get cost breakdown by model
CREATE OR REPLACE FUNCTION public.get_cost_by_model()
RETURNS TABLE(
  model_name text,
  total_cost numeric,
  total_tests bigint,
  average_cost numeric,
  total_tokens bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    tr.model_name,
    COALESCE(SUM(tr.cost_estimate), 0) as total_cost,
    COUNT(*) as total_tests,
    COALESCE(AVG(tr.cost_estimate), 0) as average_cost,
    COALESCE(SUM((tr.tokens_used->>'total_tokens')::bigint), 0) as total_tokens
  FROM public.test_results tr
  WHERE tr.status = 'completed' AND tr.model_name IS NOT NULL
  GROUP BY tr.model_name
  ORDER BY total_cost DESC;
$$;

-- Function to get daily cost trends (last 30 days)
CREATE OR REPLACE FUNCTION public.get_daily_cost_trends()
RETURNS TABLE(
  date date,
  total_cost numeric,
  test_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    date_trunc('day', tr.created_at)::date as date,
    COALESCE(SUM(tr.cost_estimate), 0) as total_cost,
    COUNT(*) as test_count
  FROM public.test_results tr
  WHERE tr.created_at >= now() - interval '30 days'
    AND tr.status = 'completed'
  GROUP BY date_trunc('day', tr.created_at)
  ORDER BY date DESC;
$$;

-- Function to get top spending users/projects
CREATE OR REPLACE FUNCTION public.get_top_spenders()
RETURNS TABLE(
  user_id uuid,
  user_email text,
  total_cost numeric,
  test_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    tr.user_id,
    p.email as user_email,
    COALESCE(SUM(tr.cost_estimate), 0) as total_cost,
    COUNT(*) as test_count
  FROM public.test_results tr
  JOIN public.profiles p ON p.id = tr.user_id
  WHERE tr.status = 'completed'
  GROUP BY tr.user_id, p.email
  ORDER BY total_cost DESC
  LIMIT 10;
$$;