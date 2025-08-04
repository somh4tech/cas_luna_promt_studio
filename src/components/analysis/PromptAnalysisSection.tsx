import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Lightbulb, Target, Sparkles, Wand2 } from 'lucide-react';
import { promptAnalyzer, type PromptAnalysisResult } from '@/utils/promptAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { storeAiAnalysis } from '@/utils/storeAnalysis';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import PromptImprovementModal from '../PromptImprovementModal';

interface PromptAnalysisSectionProps {
  promptContent: string;
  promptTitle: string;
  promptId: string;
  isOpen: boolean;
  onPromptUpdate?: (newContent: string) => void;
}

interface AIAnalysisResult {
  techniques: Array<{
    id: string;
    name: string;
    description: string;
    present: boolean;
    score: number;
    explanation?: string;
    evidence?: string;
    suggestions: string[];
    examples: string[];
  }>;
  analysisType: string;
  timestamp: string;
  originalLanguage?: string;
  detectedLanguage?: string;
  languageConfidence?: number;
}

interface ImprovementResult {
  improvedPrompt: string;
  changedSections: Array<{
    type: 'added' | 'modified' | 'enhanced';
    technique: string;
    description: string;
    before: string;
    after: string;
  }>;
  summary: string;
}

const PromptAnalysisSection = ({ promptContent, promptTitle, promptId, isOpen, onPromptUpdate }: PromptAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<PromptAnalysisResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set());
  const [isImproving, setIsImproving] = useState(false);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult | null>(null);
  const [isImprovementModalOpen, setIsImprovementModalOpen] = useState(false);
  const [isApplyingImprovement, setIsApplyingImprovement] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const { toast } = useToast();
  const { notifyAnalysisCompleted } = useAnalysisContext();

  // Load existing analysis on mount
  useEffect(() => {
    if (promptId && isOpen) {
      loadExistingAnalysis();
    }
  }, [promptId, isOpen]);

  const loadExistingAnalysis = async () => {
    if (!promptId) return;
    
    setIsLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .from('prompt_ai_analysis')
        .select('analysis_result, analysis_type, created_at, content_hash, original_language, detected_language, language_confidence')
        .eq('prompt_id', promptId)
        .eq('analysis_type', 'ai')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading existing analysis:', error);
        return;
      }

      if (data && data.length > 0) {
        const storedAnalysis = data[0];
        const result = storedAnalysis.analysis_result as any;

        // Transform stored AI analysis to match our format
        if (result.techniques) {
          const transformedResult: PromptAnalysisResult = {
            overallScore: result.techniques.filter((t: any) => t.present).length,
            colorCode: getColorCode(result.techniques.filter((t: any) => t.present).length),
            techniqueResults: result.techniques,
            summary: generateSummary(result.techniques.filter((t: any) => t.present).length),
            suggestions: generateOverallSuggestions(result.techniques)
          };

          // Add language information if available
          const aiAnalysisResult = {
            ...result,
            originalLanguage: storedAnalysis.original_language,
            detectedLanguage: storedAnalysis.detected_language,
            languageConfidence: storedAnalysis.language_confidence
          };

          setAiAnalysis(aiAnalysisResult);
          setAnalysis(transformedResult);
        }
      }
    } catch (error) {
      console.error('Error loading existing analysis:', error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  const runAiAnalysis = async () => {
    if (!promptContent || !promptId) return;
    
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-prompt-ai', {
        body: {
          content: promptContent,
          promptId,
          mode: 'analyze'
        }
      });

      if (error) throw error;

      // Check if the response indicates failure
      if (data && data.success === false) {
        throw new Error(data.error || 'AI analysis failed');
      }

      // Check for successful response
      if (data && data.success === true && data.analysis) {
        const analysis = data.analysis;
        
        // Store the AI analysis result
        await storeAiAnalysis(promptId, promptContent, analysis);

        // Transform AI result to match our analysis format
        const transformedResult: PromptAnalysisResult = {
          overallScore: analysis.overall_score || 0,
          colorCode: getColorCode(analysis.overall_score || 0),
          techniqueResults: analysis.techniques || [],
          summary: analysis.summary || generateSummary(analysis.overall_score || 0),
          suggestions: analysis.suggestions || []
        };

        setAiAnalysis(analysis);
        setAnalysis(transformedResult);
        
        // Notify that analysis is completed
        notifyAnalysisCompleted(promptId);
        
        toast({
          title: "AI Analysis Complete",
          description: "Your prompt has been analyzed using advanced AI for detailed insights.",
        });
      } else {
        throw new Error('Invalid response format from AI analysis');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI Analysis Failed",
        description: "The AI service may be temporarily unavailable. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const runPromptImprovement = async () => {
    if (!promptContent || !promptId || !aiAnalysis) {
      // Run analysis first if not available
      if (!aiAnalysis) {
        toast({
          title: "Analysis Required",
          description: "Please run AI analysis first to identify improvement opportunities.",
          variant: "destructive"
        });
        return;
      }
      return;
    }
    
    setIsImproving(true);
    try {
          const { data, error } = await supabase.functions.invoke('analyze-prompt-ai', {
            body: {
              content: promptContent,
              promptId,
              mode: 'improve',
              analysisContext: aiAnalysis
            }
          });

      if (error) throw error;

      setImprovementResult(data);
      setIsImprovementModalOpen(true);
      
      toast({
        title: "Improvement Generated",
        description: "AI has created an improved version of your prompt. Review the changes before applying.",
      });
    } catch (error) {
      console.error('Prompt improvement error:', error);
      toast({
        title: "Improvement Failed",
        description: "Failed to generate prompt improvements. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyImprovement = async (improvedPrompt: string) => {
    if (!onPromptUpdate) {
      toast({
        title: "Cannot Apply Changes",
        description: "This prompt cannot be updated from this view.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingImprovement(true);
    try {
      // Step 1: Apply the improvement
      onPromptUpdate(improvedPrompt);
      
      // Step 2: Close the improvement modal
      setIsImprovementModalOpen(false);
      setImprovementResult(null);
      
      // Step 3: Show initial success message
      toast({
        title: "Improvement Applied",
        description: "Re-analyzing the improved prompt to update your score...",
      });

      // Step 4: Re-run AI analysis with the new content
      setIsReAnalyzing(true);
      
      // Small delay to ensure the content state has updated
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-prompt-ai', {
            body: {
              content: improvedPrompt,
              promptId,
              mode: 'analyze'
            }
          });

          if (error) throw error;

          // Store the new analysis result
          await storeAiAnalysis(promptId, improvedPrompt, data);

          // Transform and update the analysis
          const transformedResult: PromptAnalysisResult = {
            overallScore: data.techniques.filter((t: any) => t.present).length,
            colorCode: getColorCode(data.techniques.filter((t: any) => t.present).length),
            techniqueResults: data.techniques,
            summary: generateSummary(data.techniques.filter((t: any) => t.present).length),
            suggestions: generateOverallSuggestions(data.techniques)
          };

          setAiAnalysis(data);
          setAnalysis(transformedResult);
          
          // Notify that analysis is completed - this updates scores everywhere
          notifyAnalysisCompleted(promptId);
          
          toast({
            title: "Analysis Complete",
            description: `Prompt improved and re-analyzed! New score: ${transformedResult.overallScore}/11`,
          });
        } catch (error) {
          console.error('Re-analysis error:', error);
          toast({
            title: "Re-analysis Failed",
            description: "Improvements applied but couldn't re-analyze. You can manually re-run analysis.",
            variant: "destructive"
          });
        } finally {
          setIsReAnalyzing(false);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error applying improvement:', error);
      toast({
        title: "Failed to Apply",
        description: "Could not apply the improvements. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingImprovement(false);
    }
  };

  const getColorCode = (score: number): 'red' | 'orange' | 'yellow' | 'green' => {
    if (score >= 9) return 'green';
    if (score >= 7) return 'yellow';
    if (score >= 4) return 'orange';
    return 'red';
  };

  const generateSummary = (score: number) => {
    if (score >= 9) {
      return `Excellent prompt engineering! Uses ${score}/11 advanced techniques.`;
    } else if (score >= 7) {
      return `Good prompt engineering. Uses ${score}/11 techniques effectively.`;
    } else if (score >= 4) {
      return `Basic prompt engineering. Uses ${score}/11 techniques, room for improvement.`;
    } else {
      return `Needs improvement. Only uses ${score}/11 techniques.`;
    }
  };

  const generateOverallSuggestions = (techniques: any[]) => {
    const missing = techniques.filter(t => !t.present);
    return [
      `Consider enhancing ${missing.length} techniques for better effectiveness`,
      ...missing.slice(0, 3).map(t => `Add ${t.name.toLowerCase()} for improved results`)
    ];
  };

  const toggleTechnique = (techniqueId: string) => {
    const newExpanded = new Set(expandedTechniques);
    if (newExpanded.has(techniqueId)) {
      newExpanded.delete(techniqueId);
    } else {
      newExpanded.add(techniqueId);
    }
    setExpandedTechniques(newExpanded);
  };

  const getScoreColor = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreText = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'Excellent';
      case 'yellow': return 'Good';
      case 'orange': return 'Basic';
      case 'red': return 'Poor';
      default: return 'Unknown';
    }
  };

  // Show loading state while loading existing analysis or re-analyzing
  if (isLoadingExisting || isReAnalyzing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">
          {isLoadingExisting ? 'Loading analysis...' : 'Re-analyzing improved prompt...'}
        </span>
      </div>
    );
  }

  // Show ready state when no analysis has been run
  if (!analysis && !isAiLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Prompt Analysis</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
              <p className="text-gray-600 mb-6">Get detailed AI-powered analysis of your prompt's effectiveness using advanced techniques.</p>
              <Button onClick={runAiAnalysis} disabled={isAiLoading || isReAnalyzing}>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isAiLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Running AI analysis...</span>
      </div>
    );
  }

  const presentTechniques = analysis?.techniqueResults.filter(t => t.present) || [];
  const missingTechniques = analysis?.techniqueResults.filter(t => !t.present) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Re-Run Analysis Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Prompt Analysis</span>
              <div className="flex items-center gap-2">
                <Button onClick={runAiAnalysis} disabled={isAiLoading || isReAnalyzing} size="sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isAiLoading ? 'Analyzing...' : 'Re-Run AI Analysis'}
                </Button>
                {aiAnalysis && (
                  <Button 
                    onClick={runPromptImprovement} 
                    disabled={isImproving || !onPromptUpdate || isReAnalyzing} 
                    size="sm"
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    {isImproving ? 'Improving...' : 'Use AI to Improve'}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              AI-powered analysis providing detailed insights into your prompt's effectiveness with contextual understanding.
            </p>
            {aiAnalysis?.detectedLanguage && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Language: {aiAnalysis.detectedLanguage === 'pt' ? 'Portuguese' : 'English'}
                  {aiAnalysis.languageConfidence && ` (${Math.round(aiAnalysis.languageConfidence * 100)}% confidence)`}
                </Badge>
              </div>
            )}
            {!onPromptUpdate && aiAnalysis && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Prompt improvements are only available in edit mode.
              </p>
            )}
            {isReAnalyzing && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Re-analyzing your improved prompt to update the score...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Overall Score */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Prompt Engineering Score</span>
                <Badge className={`${getScoreColor(analysis.colorCode)} border`}>
                  {getScoreText(analysis.colorCode)} ({analysis.overallScore}/11)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{analysis.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Present Techniques */}
        {presentTechniques.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Techniques Present ({presentTechniques.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {presentTechniques.map((technique) => (
                  <div key={technique.id} className="p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{technique.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {Math.round(technique.score * 100)}%
                      </Badge>
                    </div>
                    {aiAnalysis && (
                      <div className="space-y-2 ml-6">
                        {technique.explanation && (
                          <p className="text-xs text-gray-600">{technique.explanation}</p>
                        )}
                        {technique.evidence && (
                          <div className="bg-green-100 p-2 rounded text-xs">
                            <strong>Evidence:</strong> "{technique.evidence}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Techniques */}
        {missingTechniques.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Missing Techniques ({missingTechniques.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missingTechniques.map((technique) => (
                  <Collapsible key={technique.id}>
                    <CollapsibleTrigger
                      className="flex items-center justify-between w-full p-2 bg-red-50 rounded hover:bg-red-100 transition-colors"
                      onClick={() => toggleTechnique(technique.id)}
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{technique.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(technique.score * 100)}%
                        </Badge>
                      </div>
                      {expandedTechniques.has(technique.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-6 space-y-2">
                      <p className="text-xs text-gray-600">{technique.description}</p>
                      {technique.explanation && (
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <strong>AI Analysis:</strong> {technique.explanation}
                        </div>
                      )}
                      {technique.suggestions.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="flex items-center gap-1 mb-2">
                            <Lightbulb className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">Suggestions:</span>
                          </div>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {technique.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {technique.examples.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs font-medium text-gray-800 mb-2">Examples:</div>
                          {technique.examples.map((example, index) => (
                            <pre key={index} className="text-xs text-gray-600 whitespace-pre-wrap font-mono mb-2 last:mb-0">
                              {example}
                            </pre>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Suggestions */}
        {analysis && analysis.suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Improvement Modal */}
      <PromptImprovementModal
        isOpen={isImprovementModalOpen}
        onClose={() => {
          setIsImprovementModalOpen(false);
          setImprovementResult(null);
        }}
        originalPrompt={promptContent}
        improvementResult={improvementResult}
        onApplyImprovement={handleApplyImprovement}
        isApplying={isApplyingImprovement || isReAnalyzing}
      />
    </>
  );
};

export default PromptAnalysisSection;
