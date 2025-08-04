import { useState, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, DollarSign, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatTime, getTokensUsed, sanitizeErrorMessage, TestResult } from './utils';

interface TestResultCardProps {
  result: TestResult;
}

const TestResultCard = memo(({ result }: TestResultCardProps) => {
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  // Memoize formatted values to prevent unnecessary computations
  const formattedValues = useMemo(() => ({
    responseTime: result.response_time_ms ? formatTime(result.response_time_ms) : null,
    cost: result.cost_estimate ? formatCurrency(result.cost_estimate) : null,
    tokens: result.tokens_used ? getTokensUsed(result.tokens_used) : null,
    createdAt: new Date(result.created_at).toLocaleString(),
    inputLength: result.input_data?.length || 0
  }), [result.response_time_ms, result.cost_estimate, result.tokens_used, result.created_at, result.input_data?.length]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Test Result</p>
            {result.prompt_versions && (
              <Badge variant="outline" className="text-xs">
                v{result.prompt_versions.version_number}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {result.model_name}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {formattedValues.createdAt}
          </p>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {formattedValues.responseTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedValues.responseTime}
            </div>
          )}
          {formattedValues.cost && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formattedValues.cost}
            </div>
          )}
          {formattedValues.tokens && (
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {formattedValues.tokens} tokens
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* AI Response - Primary Focus */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-800 mb-2">AI Model Response:</p>
          {result.output_data ? (
            <pre className="text-sm bg-white p-3 rounded border whitespace-pre-wrap font-mono text-gray-900">
              {result.output_data}
            </pre>
          ) : (
            <div className="text-sm text-gray-500 italic">No response data available</div>
          )}
        </div>

        {/* Input - Collapsible */}
        <Collapsible open={isInputExpanded} onOpenChange={setIsInputExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
              {isInputExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              View Test Input ({formattedValues.inputLength} characters)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Test Input Used:</p>
              <pre className="text-sm bg-white p-2 rounded border whitespace-pre-wrap font-mono text-gray-700 max-h-32 overflow-y-auto">
                {result.input_data || 'No input data available'}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Error Message */}
        {result.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-medium text-red-800 mb-2">Error:</p>
            <div className="text-sm bg-white p-2 rounded border text-red-700 max-h-32 overflow-y-auto">
              {sanitizeErrorMessage(result.error_message)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TestResultCard.displayName = 'TestResultCard';

export default TestResultCard;