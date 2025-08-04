-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT UNIQUE NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  max_users INTEGER,
  max_projects INTEGER,
  max_ai_tests_monthly INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT REFERENCES subscription_plans(plan_name),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create monthly usage tracking table
CREATE TABLE public.monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- '2025-01'
  ai_tests_used INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  team_members_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (publicly readable)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS policies for monthly_usage
CREATE POLICY "Users can view their own usage" ON public.monthly_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.monthly_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.monthly_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" ON public.monthly_usage
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_name, price_monthly, max_users, max_projects, max_ai_tests_monthly, features) VALUES
('free', 0, 1, 2, 25, '["AI prompt testing", "Basic collaboration", "2 projects"]'),
('starter', 1900, 3, 5, 200, '["AI prompt testing", "Team collaboration", "5 projects", "Version control"]'),
('team', 4900, 10, -1, 1000, '["AI prompt testing", "Team collaboration", "Unlimited projects", "Advanced analytics", "Priority support"]'),
('enterprise', 19900, -1, -1, -1, '["Everything in Team", "Unlimited users", "SSO integration", "Custom integrations", "Dedicated support"]');

-- Create function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT plan_name FROM public.user_subscriptions 
     WHERE user_subscriptions.user_id = $1 
     AND status = 'active' 
     ORDER BY created_at DESC 
     LIMIT 1),
    'free'
  );
$$;

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_id UUID, limit_type TEXT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
  current_month TEXT;
BEGIN
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
$$;

-- Add updated_at trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_monthly_usage_updated_at
  BEFORE UPDATE ON public.monthly_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();