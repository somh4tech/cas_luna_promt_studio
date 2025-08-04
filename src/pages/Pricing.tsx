import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Star, Zap, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  displayName: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ReactNode;
  maxUsers: number | string;
  maxProjects: number | string;
  maxAITests: number | string;
}

const plans: Plan[] = [
  {
    name: 'free',
    displayName: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for individuals getting started',
    icon: <Star className="h-6 w-6" />,
    maxUsers: 1,
    maxProjects: 2,
    maxAITests: 25,
    features: [
      { name: 'AI prompt testing', included: true },
      { name: 'Basic collaboration', included: true },
      { name: '2 projects', included: true },
      { name: '25 AI tests/month', included: true },
      { name: 'Email support', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Version control', included: false },
    ],
  },
  {
    name: 'starter',
    displayName: 'Starter',
    price: 19,
    period: 'month',
    description: 'Great for small teams and growing projects',
    icon: <Zap className="h-6 w-6" />,
    maxUsers: 3,
    maxProjects: 5,
    maxAITests: 200,
    features: [
      { name: 'AI prompt testing', included: true },
      { name: 'Team collaboration', included: true },
      { name: '5 projects', included: true },
      { name: '200 AI tests/month', included: true },
      { name: 'Version control', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
    ],
  },
  {
    name: 'team',
    displayName: 'Team',
    price: 49,
    period: 'month',
    description: 'Perfect for growing teams with serious prompt needs',
    icon: <Users className="h-6 w-6" />,
    maxUsers: 10,
    maxProjects: 'Unlimited',
    maxAITests: 1000,
    popular: true,
    features: [
      { name: 'AI prompt testing', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'Unlimited projects', included: true },
      { name: '1,000 AI tests/month', included: true },
      { name: 'Version control', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
    ],
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For large organizations with advanced requirements',
    icon: <Shield className="h-6 w-6" />,
    maxUsers: 'Unlimited',
    maxProjects: 'Unlimited',
    maxAITests: 'Unlimited',
    features: [
      { name: 'Everything in Team', included: true },
      { name: 'Unlimited users', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'Unlimited AI tests', included: true },
      { name: 'SSO integration', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated support', included: true },
    ],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    if (user) {
      checkCurrentPlan();
    }
  }, [user]);

  const checkCurrentPlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.plan) {
        setCurrentPlan(data.plan);
      }
    } catch (error) {
      console.error('Error checking plan:', error);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    if (planName === 'free') {
      toast({
        title: "You're already on the free plan",
        description: "Choose a paid plan to upgrade your account.",
      });
      return;
    }

    setLoading(planName);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start for free and scale as you grow. All plans include our core AI prompt testing features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-lg scale-105' 
                  : 'border border-gray-200'
              } ${currentPlan === plan.name ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              {currentPlan === plan.name && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  {plan.price > 0 && (
                    <span className="text-lg font-normal text-gray-600">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Up to {plan.maxUsers} user{plan.maxUsers !== 1 ? 's' : ''}</div>
                  <div>{plan.maxProjects} project{plan.maxProjects !== 1 ? 's' : ''}</div>
                  <div>{plan.maxAITests} AI tests/month</div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check 
                        className={`h-4 w-4 ${
                          feature.included ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {currentPlan === plan.name ? (
                    currentPlan === 'free' ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleManageSubscription}
                      >
                        Manage Subscription
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={loading === plan.name}
                    >
                      {loading === plan.name ? 'Processing...' : 
                       plan.price === 0 ? 'Get Started' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom solution? Contact us for enterprise pricing.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>✓ 30-day money back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ No setup fees</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;