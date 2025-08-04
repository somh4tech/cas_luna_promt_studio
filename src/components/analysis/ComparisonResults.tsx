import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Cpu, Trophy, Zap } from 'lucide-react';
import { TestResult, formatCurrency, formatTime, getTokensUsed } from '../test-section/utils';

interface ComparisonResultsProps {
  results: TestResult[];
  inputData: string;
  isCompact?: boolean;
}

const ComparisonResults = ({ results, inputData, isCompact = false }: ComparisonResultsProps) => {
  if (!results || !Array.isArray(results)) {
    return (
      <div className="text-center py-8 text-gray-500">
        No test results available.
      </div>
    );
  }

  const getModelDisplayName = (modelName: string) => {
    const modelMap: { [key: string]: string } = {
      'gemini-1.5-flash': 'Gemini Flash',
      'gemini-1.5-pro': 'Gemini Pro',
      'gpt-4.1-2025-04-14': 'GPT-4.1',
      'o3-2025-04-16': 'O3',
      'o4-mini-2025-04-16': 'O4 Mini'
    };
    return modelMap[modelName] || modelName;
  };

  const getProvider = (modelName: string) => {
    if (modelName.startsWith('gemini')) return 'Google';
    if (modelName.startsWith('gpt') || modelName.startsWith('o')) return 'OpenAI';
    return 'Unknown';
  };

  // Find best performing models
  const fastestModel = results.reduce((fastest, current) => 
    current.response_time_ms < fastest.response_time_ms ? current : fastest
  );
  
  const cheapestModel = results.reduce((cheapest, current) => 
    current.cost_estimate < cheapest.cost_estimate ? current : cheapest
  );

  const longestResponse = results.reduce((longest, current) => 
    current.output_data.length > longest.output_data.length ? current : longest
  );

  const getPerformanceBadges = (result: TestResult) => {
    const badges = [];
    if (result.id === fastestModel.id) {
      badges.push(<Badge key="fastest" variant="secondary" className="bg-green-100 text-green-800"><Zap className="h-3 w-3 mr-1" />Fastest</Badge>);
    }
    if (result.id === cheapestModel.id) {
      badges.push(<Badge key="cheapest" variant="secondary" className="bg-blue-100 text-blue-800"><DollarSign className="h-3 w-3 mr-1" />Cheapest</Badge>);
    }
    if (result.id === longestResponse.id) {
      badges.push(<Badge key="longest" variant="secondary" className="bg-purple-100 text-purple-800"><Trophy className="h-3 w-3 mr-1" />Most Detailed</Badge>);
    }
    return badges;
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comparison results yet. Run a multi-model test to see results here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input Summary - Only show in non-compact mode */}
      {!isCompact && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Test Input</h3>
              <Badge variant="outline">{results.length} models tested</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 max-h-32 overflow-y-auto">
                {inputData}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-1'}`}>
        {results.map((result) => (
          <Card key={result.id} className="relative">
            <CardHeader className={isCompact ? "pb-2" : "pb-3"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{getModelDisplayName(result.model_name)}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getProvider(result.model_name)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceBadges(result)}
                </div>
              </div>
              
              {/* Metrics */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(result.response_time_ms)}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(result.cost_estimate)}
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  {getTokensUsed(result.tokens_used)} tokens
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-2">Response:</p>
                <div className={`bg-white rounded border p-3 overflow-y-auto ${isCompact ? 'max-h-32' : 'max-h-64'}`}>
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-900">
                    {isCompact && result.output_data.length > 200 
                      ? result.output_data.substring(0, 200) + '...'
                      : result.output_data
                    }
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats - Only show in non-compact mode */}
      {!isCompact && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Comparison Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(Math.min(...results.map(r => r.response_time_ms)))}
                </div>
                <div className="text-sm text-gray-500">Fastest Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(Math.min(...results.map(r => r.cost_estimate)))}
                </div>
                <div className="text-sm text-gray-500">Lowest Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...results.map(r => r.output_data.length)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Max Characters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(results.reduce((sum, r) => sum + r.cost_estimate, 0))}
                </div>
                <div className="text-sm text-gray-500">Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonResults;