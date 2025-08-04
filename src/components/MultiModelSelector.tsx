import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelConfig } from './ModelSelector';

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

interface MultiModelSelectorProps {
  selectedModels: string[];
  onSelectedModelsChange: (models: string[]) => void;
}

const MultiModelSelector = ({
  selectedModels,
  onSelectedModelsChange
}: MultiModelSelectorProps) => {
  const [selectAll, setSelectAll] = useState(false);

  // Group models by provider
  const googleModels = AVAILABLE_MODELS.filter(m => m.provider === 'Google');
  const openAiModels = AVAILABLE_MODELS.filter(m => m.provider === 'OpenAI');
  const anthropicModels = AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic');

  const handleModelToggle = (modelName: string) => {
    const newSelectedModels = selectedModels.includes(modelName)
      ? selectedModels.filter(m => m !== modelName)
      : [...selectedModels, modelName];
    
    onSelectedModelsChange(newSelectedModels);
    setSelectAll(newSelectedModels.length === AVAILABLE_MODELS.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectedModelsChange([]);
      setSelectAll(false);
    } else {
      onSelectedModelsChange(AVAILABLE_MODELS.map(m => m.name));
      setSelectAll(true);
    }
  };

  const totalEstimatedCost = selectedModels.reduce((total, modelName) => {
    const model = AVAILABLE_MODELS.find(m => m.name === modelName);
    return total + (model ? model.costPer1kTokens : 0);
  }, 0);

  const ModelGroup = ({ title, models, emoji }: { title: string; models: ModelConfig[]; emoji: string }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <span>{emoji}</span>
        <span>{title}</span>
      </div>
      <div className="grid gap-2">
        {models.map((model) => (
          <div key={model.name} className="flex items-start space-x-3 p-2 rounded-lg border hover:bg-gray-50 transition-colors">
            <Checkbox
              id={model.name}
              checked={selectedModels.includes(model.name)}
              onCheckedChange={() => handleModelToggle(model.name)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label htmlFor={model.name} className="text-sm font-medium cursor-pointer">
                {model.displayName}
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  ${model.costPer1kTokens.toFixed(4)}/1k tokens
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Max: {model.maxTokens.toLocaleString()} tokens
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Select Models for Comparison</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm cursor-pointer">
              Select All
            </Label>
          </div>
        </div>
        {selectedModels.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">
              {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected
            </Badge>
            <Badge variant="outline">
              Est. cost: ${totalEstimatedCost.toFixed(4)}/1k tokens
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ModelGroup title="Google" models={googleModels} emoji="🔍" />
        <ModelGroup title="OpenAI" models={openAiModels} emoji="🤖" />
        <ModelGroup title="Anthropic" models={anthropicModels} emoji="🧠" />
      </CardContent>
    </Card>
  );
};

export default MultiModelSelector;