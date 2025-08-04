-- Update check_usage_limit function to grant unlimited usage for @cascadeaipartners.com users
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_id uuid, limit_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  user_email TEXT;
  user_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
  current_month TEXT;
BEGIN
  -- Check if user has @cascadeaipartners.com email for unlimited access
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  IF user_email LIKE '%@cascadeaipartners.com' THEN
    RETURN true; -- Unlimited access for company users
  END IF;
  
  -- Get user's current plan
  user_plan := public.get_user_plan(user_id);
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get plan limits
  IF limit_type = 'ai_tests' THEN
    SELECT max_ai_tests_monthly INTO plan_limit 
    FROM public.subscription_plans 
    WHERE plan_name = user_plan;
    
    -- Get current usage
    SELECT COALESCE(ai_tests_used, 0) INTO current_usage
    FROM public.monthly_usage 
    WHERE monthly_usage.user_id = $1 AND month_year = current_month;
    
  ELSIF limit_type = 'projects' THEN
    SELECT max_projects INTO plan_limit 
    FROM public.subscription_plans 
    WHERE plan_name = user_plan;
    
    -- Get current project count
    SELECT COUNT(*) INTO current_usage
    FROM public.projects 
    WHERE projects.user_id = $1;
    
  ELSE
    RETURN false;
  END IF;
  
  -- -1 means unlimited
  IF plan_limit = -1 THEN
    RETURN true;
  END IF;
  
  RETURN current_usage < plan_limit;
END;
$function$