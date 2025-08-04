import { useState, useMemo, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, DollarSign, Cpu, Trophy, Zap, X, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestResult, formatCurrency, formatTime, getTokensUsed } from '../test-section/utils';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResult[];
  inputData: string;
}

const ComparisonModal = memo(({ isOpen, onClose, results, inputData }: ComparisonModalProps) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  if (!results || !Array.isArray(results)) {
    return null;
  }

  const getModelDisplayName = useCallback((modelName: string) => {
    const modelMap: { [key: string]: string } = {
      'gemini-1.5-flash': 'Gemini Flash',
      'gemini-1.5-pro': 'Gemini Pro',
      'gpt-4.1-2025-04-14': 'GPT-4.1',
      'o3-2025-04-16': 'O3',
      'o4-mini-2025-04-16': 'O4 Mini'
    };
    return modelMap[modelName] || modelName;
  }, []);

  const getProvider = useCallback((modelName: string) => {
    if (modelName.startsWith('gemini')) return 'Google';
    if (modelName.startsWith('gpt') || modelName.startsWith('o')) return 'OpenAI';
    return 'Unknown';
  }, []);

  // Memoize performance calculations
  const performanceData = useMemo(() => {
    if (!results.length) return { fastestModel: null, cheapestModel: null, longestResponse: null };
    
    const fastestModel = results.reduce((fastest, current) => 
      current.response_time_ms < fastest.response_time_ms ? current : fastest
    );
    
    const cheapestModel = results.reduce((cheapest, current) => 
      current.cost_estimate < cheapest.cost_estimate ? current : cheapest
    );

    const longestResponse = results.reduce((longest, current) => 
      current.output_data.length > longest.output_data.length ? current : longest
    );

    return { fastestModel, cheapestModel, longestResponse };
  }, [results]);

  // Memoize quick stats calculations
  const quickStats = useMemo(() => {
    if (!results.length) return { fastestTime: 0, cheapestCost: 0, maxChars: 0, totalCost: 0 };
    
    return {
      fastestTime: Math.min(...results.map(r => r.response_time_ms)),
      cheapestCost: Math.min(...results.map(r => r.cost_estimate)),
      maxChars: Math.max(...results.map(r => r.output_data.length)),
      totalCost: results.reduce((sum, r) => sum + r.cost_estimate, 0)
    };
  }, [results]);

  const getPerformanceBadges = useCallback((result: TestResult) => {
    const badges = [];
    const { fastestModel, cheapestModel, longestResponse } = performanceData;
    
    if (fastestModel && result.id === fastestModel.id) {
      badges.push(<Badge key="fastest" variant="secondary" className="bg-green-100 text-green-800"><Zap className="h-3 w-3 mr-1" />Fastest</Badge>);
    }
    if (cheapestModel && result.id === cheapestModel.id) {
      badges.push(<Badge key="cheapest" variant="secondary" className="bg-blue-100 text-blue-800"><DollarSign className="h-3 w-3 mr-1" />Cheapest</Badge>);
    }
    if (longestResponse && result.id === longestResponse.id) {
      badges.push(<Badge key="longest" variant="secondary" className="bg-purple-100 text-purple-800"><Trophy className="h-3 w-3 mr-1" />Most Detailed</Badge>);
    }
    return badges;
  }, [performanceData]);

  const exportResults = useCallback(() => {
    const data = {
      input: inputData,
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        model: getModelDisplayName(r.model_name),
        provider: getProvider(r.model_name),
        response: r.output_data,
        time: formatTime(r.response_time_ms),
        cost: formatCurrency(r.cost_estimate),
        tokens: getTokensUsed(r.tokens_used)
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-comparison-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [inputData, results]);

  if (results.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Model Comparison Results</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{results.length} models tested</Badge>
                <Badge variant="outline">{new Date(results[0].created_at).toLocaleString()}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Input Summary - Sticky */}
            <Card className="border-2 border-muted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Test Input</h3>
                  <Badge variant="outline">{inputData.length} characters</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                    {inputData}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(quickStats.fastestTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">Fastest</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(quickStats.cheapestCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cheapest</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {quickStats.maxChars.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Max Chars</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(quickStats.totalCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                </CardContent>
              </Card>
            </div>

            {/* Model Results Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {results.map((result) => (
                <Card key={result.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{getModelDisplayName(result.model_name)}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getProvider(result.model_name)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPerformanceBadges(result)}
                      </div>
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {result.output_data}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

ComparisonModal.displayName = 'ComparisonModal';

export default ComparisonModal;