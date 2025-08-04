import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ResizableTextarea } from '@/components/ui/resizable-textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, RotateCcw, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModelSelector from '../ModelSelector';
import MultiModelSelector from '../MultiModelSelector';

interface TestFormProps {
  onSubmit: (params: {
    input: string;
    testMode: 'single' | 'multi';
    selectedModel: string;
    selectedModels: string[];
    temperature: number;
    maxTokens: number;
  }) => void;
  promptContent: string;
  promptTitle: string;
  promptVersion: number;
  isLoading: boolean;
}

const TestForm = memo(({ 
  onSubmit, 
  promptContent, 
  promptTitle, 
  promptVersion, 
  isLoading 
}: TestFormProps) => {
  const { toast } = useToast();
  const [testInput, setTestInput] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [testMode, setTestMode] = useState<'single' | 'multi'>('single');
  const [selectedModel, setSelectedModel] = useState('google/gemini-flash-1.5');
  const [selectedModels, setSelectedModels] = useState<string[]>(['google/gemini-flash-1.5', 'openai/gpt-4o-mini']);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);

  // Auto-populate test input when prompt content is available
  useEffect(() => {
    if (promptContent && !testInput) {
      setTestInput(promptContent);
      setIsAutoFilled(true);
    }
  }, [promptContent]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (testInput.trim()) {
      if (testMode === 'multi' && selectedModels.length === 0) {
        toast({
          title: "No models selected",
          description: "Please select at least one model for comparison testing.",
          variant: "destructive"
        });
        return;
      }

      onSubmit({
        input: testInput,
        testMode,
        selectedModel,
        selectedModels,
        temperature,
        maxTokens
      });
      
      setTestInput('');
      setIsAutoFilled(false);
    }
  }, [testInput, testMode, selectedModels, selectedModel, temperature, maxTokens, onSubmit, toast]);

  const handleClear = useCallback(() => {
    setTestInput('');
    setIsAutoFilled(false);
  }, []);

  const handleUseCurrentPrompt = useCallback(() => {
    setTestInput(promptContent);
    setIsAutoFilled(true);
  }, [promptContent]);

  return (
    <div className="space-y-6">
      {/* Prompt Context Header */}
      {promptTitle && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Testing Prompt</span>
            <Badge variant="outline" className="text-xs">
              v{promptVersion}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-blue-900 mb-1">{promptTitle}</h3>
          <p className="text-xs text-blue-700">
            {promptContent.length} characters | {promptContent.split('\n').length} lines
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs value={testMode} onValueChange={(value: string) => setTestMode(value as 'single' | 'multi')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Model</TabsTrigger>
            <TabsTrigger value="multi">Compare Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <ModelSelector
              selectedModel={selectedModel}
              temperature={temperature}
              maxTokens={maxTokens}
              onModelChange={setSelectedModel}
              onTemperatureChange={setTemperature}
              onMaxTokensChange={setMaxTokens}
            />
          </TabsContent>
          
          <TabsContent value="multi" className="space-y-4">
            <MultiModelSelector
              selectedModels={selectedModels}
              onSelectedModelsChange={setSelectedModels}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Temperature: {temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Max Tokens: {maxTokens}</Label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="test-input">Test Input</Label>
            <div className="flex items-center gap-2">
              {isAutoFilled && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Auto-filled from current prompt
                </span>
              )}
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={!testInput}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentPrompt}
                  disabled={!promptContent || testInput === promptContent}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Use Current Prompt
                </Button>
              </div>
            </div>
          </div>
          <ResizableTextarea
            id="test-input"
            placeholder="Test input will be auto-filled from your current prompt, or enter custom test input..."
            value={testInput}
            onChange={(e) => {
              setTestInput(e.target.value);
              setIsAutoFilled(false);
            }}
            minRows={4}
            maxRows={10}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !testInput.trim() || (testMode === 'multi' && selectedModels.length === 0)}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          {isLoading
            ? testMode === 'multi' 
              ? `Testing ${selectedModels.length} models...` 
              : 'Running Test...'
            : testMode === 'multi'
              ? `Compare ${selectedModels.length} Models`
              : isAutoFilled 
                ? 'Test Current Prompt' 
                : 'Run Test'
          }
        </Button>
      </form>
    </div>
  );
});

TestForm.displayName = 'TestForm';

export default TestForm;