import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestDebuggerProps {
  promptId: string;
}

interface HealthCheckResult {
  status: string;
  checks: {
    supabase_client: string;
    database_connectivity: string;
    openrouter_api_key: string;
    openrouter_connectivity: string;
  };
  timestamp: string;
  version: string;
}

const TestDebugger = ({ promptId }: TestDebuggerProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setError(null);
    setHealthCheck(null);

    try {
      console.log('[TestDebugger] Starting diagnostic tests...');
      
      // Test authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Authentication failed - please log in again');
      }
      console.log('[TestDebugger] Authentication check passed');

      // Test health check endpoint
      const response = await supabase.functions.invoke('health-check');
      
      if (response.error) {
        console.error('[TestDebugger] Health check failed:', response.error);
        throw new Error(`Health check failed: ${response.error.message}`);
      }

      console.log('[TestDebugger] Health check passed:', response.data);
      setHealthCheck(response.data);

      toast({
        title: "Diagnostics completed",
        description: "All systems are operational",
      });

    } catch (error: any) {
      console.error('[TestDebugger] Diagnostic error:', error);
      setError(error.message);
      toast({
        title: "Diagnostic failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="p-4 mt-4 border-orange-200 bg-orange-50">
      <div className="flex items-center gap-2 mb-3">
        <Bug className="h-4 w-4 text-orange-600" />
        <h3 className="font-medium text-orange-900">Test Diagnostics</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-orange-700">
          Run diagnostics to check system health and identify issues with the test functionality.
        </p>

        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Bug className="h-4 w-4 mr-2" />
              Run System Diagnostics
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Diagnostic Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {healthCheck && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(healthCheck.status)}
              <span className="text-sm font-medium">System Status</span>
              <Badge className={getStatusColor(healthCheck.status)}>
                {healthCheck.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Supabase Client:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(healthCheck.checks.supabase_client)}
                  <Badge variant="outline" className={getStatusColor(healthCheck.checks.supabase_client)}>
                    {healthCheck.checks.supabase_client}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Database Connection:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(healthCheck.checks.database_connectivity)}
                  <Badge variant="outline" className={getStatusColor(healthCheck.checks.database_connectivity)}>
                    {healthCheck.checks.database_connectivity}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>OpenRouter API Key:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(healthCheck.checks.openrouter_api_key)}
                  <Badge variant="outline" className={getStatusColor(healthCheck.checks.openrouter_api_key)}>
                    {healthCheck.checks.openrouter_api_key}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>OpenRouter Connectivity:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(healthCheck.checks.openrouter_connectivity)}
                  <Badge variant="outline" className={getStatusColor(healthCheck.checks.openrouter_connectivity)}>
                    {healthCheck.checks.openrouter_connectivity}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Last check: {new Date(healthCheck.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TestDebugger;