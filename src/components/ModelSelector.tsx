
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface ModelConfig {
  name: string;
  displayName: string;
  description: string;
  costPer1kTokens: number;
  maxTokens: number;
  provider: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

const AVAILABLE_MODELS: ModelConfig[] = [
  // Gemini Models via OpenRouter
  {
    name: 'google/gemini-flash-1.5',
    displayName: 'Gemini Flash',
    description: 'Fast & efficient for most tasks',
    costPer1kTokens: 0.00015,
    maxTokens: 8192,
    provider: 'Google',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000
  },
  {
    name: 'google/gemini-pro-1.5',
    displayName: 'Gemini Pro',
    description: 'Most capable for complex tasks',
    costPer1kTokens: 0.0035,
    maxTokens: 32768,
    provider: 'Google',
    defaultTemperature: 0.5,
    defaultMaxTokens: 2000
  },
  // OpenAI Models via OpenRouter
  {
    name: 'openai/gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    description: 'Flagship model with excellent reasoning',
    costPer1kTokens: 0.01,
    maxTokens: 4096,
    provider: 'OpenAI',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000
  },
  {
    name: 'openai/o1-preview',
    displayName: 'O1 Preview',
    description: 'Best reasoning model',
    costPer1kTokens: 0.015,
    maxTokens: 4096,
    provider: 'OpenAI',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1500
  },
  {
    name: 'openai/gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    description: 'Fast reasoning with efficiency',
    costPer1kTokens: 0.0015,
    maxTokens: 4096,
    provider: 'OpenAI',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000
  },
  // Claude Models via OpenRouter
  {
    name: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    description: 'Most capable reasoning and analysis',
    costPer1kTokens: 0.003,
    maxTokens: 8192,
    provider: 'Anthropic',
    defaultTemperature: 0.5,
    defaultMaxTokens: 2000
  },
  {
    name: 'anthropic/claude-3-opus',
    displayName: 'Claude 3 Opus',
    description: 'Most powerful model for complex tasks',
    costPer1kTokens: 0.015,
    maxTokens: 4096,
    provider: 'Anthropic',
    defaultTemperature: 0.3,
    defaultMaxTokens: 1500
  },
  {
    name: 'anthropic/claude-3-haiku',
    displayName: 'Claude 3 Haiku',
    description: 'Fast and efficient for simple tasks',
    costPer1kTokens: 0.00025,
    maxTokens: 4096,
    provider: 'Anthropic',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  onModelChange: (model: string) => void;
  onTemperatureChange: (temperature: number) => void;
  onMaxTokensChange: (maxTokens: number) => void;
}

const ModelSelector = ({
  selectedModel,
  temperature,
  maxTokens,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange
}: ModelSelectorProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currentModel = AVAILABLE_MODELS.find(m => m.name === selectedModel) || AVAILABLE_MODELS[0];

  // Group models by provider
  const googleModels = AVAILABLE_MODELS.filter(m => m.provider === 'Google');
  const openAiModels = AVAILABLE_MODELS.filter(m => m.provider === 'OpenAI');
  const anthropicModels = AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic');

  const handleModelChange = (modelName: string) => {
    const model = AVAILABLE_MODELS.find(m => m.name === modelName);
    if (model) {
      onModelChange(modelName);
      // Set smart defaults when model changes
      onTemperatureChange(model.defaultTemperature);
      onMaxTokensChange(model.defaultMaxTokens);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="model-select" className="text-sm font-medium">
          AI Model
        </Label>
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
              🔍 Google
            </div>
            {googleModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{model.displayName}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </SelectItem>
            ))}
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 mt-1">
              🤖 OpenAI
            </div>
            {openAiModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{model.displayName}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </SelectItem>
            ))}
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 mt-1">
              🧠 Anthropic
            </div>
            {anthropicModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{model.displayName}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
            Advanced Settings
            <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature" className="text-xs">Temperature</Label>
              <span className="text-xs text-gray-500">{temperature}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => onTemperatureChange(value[0])}
              className="w-full"
            />
            <div className="text-xs text-gray-500">
              Lower = focused, Higher = creative
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-tokens" className="text-xs">Max Tokens</Label>
              <span className="text-xs text-gray-500">{maxTokens}</span>
            </div>
            <Slider
              id="max-tokens"
              min={100}
              max={currentModel.maxTokens}
              step={100}
              value={[maxTokens]}
              onValueChange={(value) => onMaxTokensChange(value[0])}
              className="w-full"
            />
            <div className="text-xs text-gray-500">
              Maximum response length
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ModelSelector;
