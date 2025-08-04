import { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Maximize2, RefreshCw } from 'lucide-react';
import ComparisonResults from '../analysis/ComparisonResults';
import ComparisonModal from '../analysis/ComparisonModal';
import TestResultCard from './TestResultCard';
import { TestResult, validateTestResult } from './utils';

interface TestResultsProps {
  testResults: TestResult[] | undefined;
  isLoading?: boolean;
  onManualRefresh?: () => void;
}

const TestResults = memo(({ testResults, isLoading, onManualRefresh }: TestResultsProps) => {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [activeComparisonResults, setActiveComparisonResults] = useState<TestResult[]>([]);
  const [activeComparisonInput, setActiveComparisonInput] = useState('');

  // Memoize grouped results computation with proper error handling
  const groupedResults = useMemo(() => {
    if (!testResults || !Array.isArray(testResults)) {
      return {};
    }
    
    try {
      // Filter out invalid results first
      const validResults = testResults.filter(result => {
        if (!validateTestResult(result)) {
          console.warn('Invalid test result skipped:', result);
          return false;
        }
        return true;
      });

      return validResults.reduce((groups: Record<string, TestResult[]>, result: TestResult) => {
        const batchId = result.batch_id || `single_${result.id}`;
        if (!groups[batchId]) {
          groups[batchId] = [];
        }
        groups[batchId].push(result);
        return groups;
      }, {});
    } catch (error) {
      console.error('Error grouping test results:', error, testResults);
      return {};
    }
  }, [testResults]);

  const handleViewComparison = useCallback((results: TestResult[]) => {
    if (!results || results.length === 0) {
      console.error('No results provided to comparison');
      return;
    }
    
    setActiveComparisonResults(results);
    setActiveComparisonInput(results[0]?.input_data || '');
    setIsComparisonModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Test Results</h3>
        {onManualRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onManualRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedResults).map(([batchId, results]: [string, TestResult[]]) => {
          if (!Array.isArray(results) || results.length === 0) {
            return null;
          }
          
          const isMultiModelTest = results.length > 1;
          const sortedResults = results.sort((a: TestResult, b: TestResult) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });
          
           if (isMultiModelTest) {
             // Check for mixed success/failure states
             const hasErrors = results.some(r => r.error_message);
             const hasSuccess = results.some(r => r.output_data && !r.error_message);
             
             return (
               <Card key={batchId} className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                 <CardHeader className="pb-2">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                         <Trophy className="h-3 w-3 mr-1" />
                         Multi-Model Comparison
                       </Badge>
                       <Badge variant="outline">{results.length} models</Badge>
                       {hasErrors && (
                         <Badge variant="destructive" className="text-xs">
                           {results.filter(r => r.error_message).length} errors
                         </Badge>
                       )}
                       <span className="text-xs text-gray-500">
                         {new Date(sortedResults[0].created_at).toLocaleString()}
                       </span>
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleViewComparison(sortedResults)}
                       className="gap-2"
                     >
                       <Maximize2 className="h-3 w-3" />
                       View Full Comparison
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   {hasSuccess ? (
                     <ComparisonResults 
                       results={sortedResults} 
                       inputData={sortedResults[0].input_data || ''}
                       isCompact={true}
                     />
                   ) : (
                     <div className="text-center py-4 text-red-600">
                       <p className="text-sm">All models failed for this test</p>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => handleViewComparison(sortedResults)}
                         className="mt-2"
                       >
                         View Error Details
                       </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
             );
          } else {
            return <TestResultCard key={results[0].id} result={results[0]} />;
          }
        })}
        {isLoading && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading test results...
            </div>
          </div>
        )}
        {!isLoading && Object.keys(groupedResults).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No test results yet. Run your first test above!
          </p>
        )}
      </div>

      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        results={activeComparisonResults}
        inputData={activeComparisonInput}
      />
    </div>
  );
});

TestResults.displayName = 'TestResults';

export default TestResults;