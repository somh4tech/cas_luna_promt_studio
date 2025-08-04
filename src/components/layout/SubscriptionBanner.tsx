import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface SubscriptionBannerProps {
  plan: string;
  usage?: {
    ai_tests_used: number;
    projects_count: number;
  };
  planLimits?: {
    max_ai_tests_monthly: number;
    max_projects: number;
  };
}

const SubscriptionBanner = ({ plan, usage, planLimits }: SubscriptionBannerProps) => {
  const navigate = useNavigate();

  if (!usage || !planLimits) return null;

  const aiTestsPercent = planLimits.max_ai_tests_monthly === -1 
    ? 0 
    : (usage.ai_tests_used / planLimits.max_ai_tests_monthly) * 100;

  const projectsPercent = planLimits.max_projects === -1 
    ? 0 
    : (usage.projects_count / planLimits.max_projects) * 100;

  const isNearLimit = aiTestsPercent > 80 || projectsPercent > 80;
  const isAtLimit = aiTestsPercent >= 100 || projectsPercent >= 100;

  if (plan === 'free' && (isNearLimit || isAtLimit)) {
    return (
      <Alert className={`mb-6 ${isAtLimit ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`} />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${isAtLimit ? 'text-red-800' : 'text-yellow-800'}`}>
              {isAtLimit ? 'Usage limits reached' : 'Approaching usage limits'}
            </p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">AI Tests:</span>
                <Progress value={aiTestsPercent} className="w-24 h-2" />
                <span className="text-xs text-gray-500">
                  {usage.ai_tests_used}/{planLimits.max_ai_tests_monthly}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Projects:</span>
                <Progress value={projectsPercent} className="w-24 h-2" />
                <span className="text-xs text-gray-500">
                  {usage.projects_count}/{planLimits.max_projects}
                </span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            size="sm"
            className="ml-4"
          >
            <Zap className="h-4 w-4 mr-1" />
            Upgrade
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SubscriptionBanner;