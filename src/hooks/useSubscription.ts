import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  plan: string;
  status: string;
  current_period_end?: string;
}

interface UsageData {
  ai_tests_used: number;
  projects_count: number;
  team_members_count: number;
  month_year: string;
}

interface PlanLimits {
  max_users: number;
  max_projects: number;
  max_ai_tests_monthly: number;
  features: any;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    plan: 'free',
    status: 'active'
  });
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setSubscription(data || { subscribed: false, plan: 'free', status: 'active' });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false, plan: 'free', status: 'active' });
    }
  };

  const getCurrentUsage = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase
        .from('monthly_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setUsage(data || {
        ai_tests_used: 0,
        projects_count: 0,
        team_members_count: 1,
        month_year: currentMonth
      });
    } catch (error) {
      console.error('Error getting usage:', error);
    }
  };

  const getPlanLimits = async (planName: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_name', planName)
        .single();

      if (error) throw error;
      setPlanLimits(data);
    } catch (error) {
      console.error('Error getting plan limits:', error);
    }
  };

  const incrementAIUsage = async () => {
    if (!user) return false;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Check current usage first
      const { data: currentUsageData } = await supabase
        .from('monthly_usage')
        .select('ai_tests_used')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      const currentUsage = currentUsageData?.ai_tests_used || 0;
      
      // Check if user can perform this action
      const { data: canPerform } = await supabase.rpc('check_usage_limit', {
        user_id: user.id,
        limit_type: 'ai_tests'
      });

      if (!canPerform) {
        return false; // Usage limit exceeded
      }

      // Increment usage
      await supabase
        .from('monthly_usage')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          ai_tests_used: currentUsage + 1,
          projects_count: usage?.projects_count || 0,
          team_members_count: usage?.team_members_count || 1
        }, { onConflict: 'user_id,month_year' });

      // Refresh usage data
      getCurrentUsage();
      return true;
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
      return false;
    }
  };

  const canCreateProject = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase.rpc('check_usage_limit', {
        user_id: user.id,
        limit_type: 'projects'
      });

      return data || false;
    } catch (error) {
      console.error('Error checking project limit:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        checkSubscription(),
        getCurrentUsage()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (subscription.plan) {
      getPlanLimits(subscription.plan);
    }
  }, [subscription.plan]);

  return {
    subscription,
    usage,
    planLimits,
    loading,
    checkSubscription,
    getCurrentUsage,
    incrementAIUsage,
    canCreateProject,
    refresh: () => {
      checkSubscription();
      getCurrentUsage();
    }
  };
};