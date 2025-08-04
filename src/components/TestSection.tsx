
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ErrorBoundary from './layout/ErrorBoundary';
import TestForm from './test-section/TestForm';
import TestResults from './test-section/TestResults';
// import TestDebugger from './test-section/TestDebugger'; // Commented out for production
import { useTestMutations } from '@/hooks/useTestMutations';

interface TestSectionProps {
  promptId: string;
  isOpen: boolean;
  promptContent?: string;
  promptTitle?: string;
  promptVersion?: number;
}

const TestSection = ({ 
  promptId, 
  isOpen, 
  promptContent = '', 
  promptTitle = '',
  promptVersion = 1 
}: TestSectionProps) => {
  const { runSingleTest, runMultiTest, isLoading } = useTestMutations();

  const { data: testResults, error, isLoading: isLoadingResults, refetch } = useQuery({
    queryKey: ['test_results', promptId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            *,
            prompt_versions(version_number, title)
          `)
          .eq('prompt_id', promptId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[TestSection] Supabase query error:', error);
          throw new Error(`Failed to fetch test results: ${error.message}`);
        }
        
        return data || [];
      } catch (err) {
        console.error('[TestSection] Test results query failed:', err);
        throw err;
      }
    },
    enabled: isOpen && !!promptId,
    retry: 1,
    staleTime: 0, // Always refetch to get latest results
    gcTime: 0, // Don't cache results
  });

  const handleFormSubmit = (params: {
    input: string;
    testMode: 'single' | 'multi';
    selectedModel: string;
    selectedModels: string[];
    temperature: number;
    maxTokens: number;
  }) => {
    try {
      if (params.testMode === 'single') {
        runSingleTest({
          promptId,
          input: params.input,
          model: params.selectedModel,
          temp: params.temperature,
          tokens: params.maxTokens
        });
      } else {
        runMultiTest({
          promptId,
          input: params.input,
          models: params.selectedModels,
          temp: params.temperature,
          tokens: params.maxTokens
        });
      }
    } catch (error) {
      console.error('[TestSection] Error submitting test:', error);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">Error loading test results</p>
        <p className="text-sm text-red-500 mt-1">
          {error.message || 'Please check your connection and try again.'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-red-600 underline hover:no-underline"
        >
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <TestForm
          onSubmit={handleFormSubmit}
          promptContent={promptContent}
          promptTitle={promptTitle}
          promptVersion={promptVersion}
          isLoading={isLoading}
        />
        
        {/* <TestDebugger promptId={promptId} /> */}
        
        <TestResults 
          testResults={testResults} 
          isLoading={isLoadingResults || isLoading}
          onManualRefresh={refetch}
        />
      </div>
    </ErrorBoundary>
  );
};


export default TestSection;
