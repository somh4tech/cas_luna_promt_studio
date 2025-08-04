
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, ArrowRight, Sparkles, X, Copy } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface PromptImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  improvementResult: ImprovementResult | null;
  onApplyImprovement: (improvedPrompt: string) => void;
  isApplying?: boolean;
}

const PromptImprovementModal = ({
  isOpen,
  onClose,
  originalPrompt,
  improvementResult,
  onApplyImprovement,
  isApplying = false
}: PromptImprovementModalProps) => {
  const { toast } = useToast();
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);

  if (!improvementResult) return null;

  const handleApply = () => {
    onApplyImprovement(improvementResult.improvedPrompt);
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-100 text-green-800 border-green-200';
      case 'modified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enhanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCopy = async (text: string, type: 'original' | 'improved') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedImproved(true);
        setTimeout(() => setCopiedImproved(false), 2000);
      }
      toast({
        title: "Copied to clipboard",
        description: `${type === 'original' ? 'Original' : 'Improved'} prompt copied successfully.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Prompt Improvement
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs defaultValue="comparison" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-4">
              <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
              <TabsTrigger value="changes">Changes Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="flex-1 min-h-0 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-h-[calc(95vh-280px)]">
                <Card className="flex flex-col bg-slate-50 min-h-0">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <CardTitle className="text-base text-slate-700 flex items-center justify-between">
                      Original Prompt
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(originalPrompt, 'original')}
                        className="h-8 px-3"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copiedOriginal ? 'Copied!' : 'Copy'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 pt-0 pb-4">
                    <ScrollArea className="h-full border rounded-md">
                      <div className="p-4">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800 break-words">
                          {originalPrompt}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="flex flex-col bg-purple-50 border-purple-200 min-h-0">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <CardTitle className="text-base text-purple-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Improved Prompt
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(improvementResult.improvedPrompt, 'improved')}
                        className="h-8 px-3"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copiedImproved ? 'Copied!' : 'Copy'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 pt-0 pb-4">
                    <ScrollArea className="h-full border border-purple-200 rounded-md">
                      <div className="p-4">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-purple-800 break-words">
                          {improvementResult.improvedPrompt}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="changes" className="flex-1 min-h-0 mt-0">
              <div className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4">
                    {/* Summary */}
                    <Card className="bg-purple-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-purple-800">Improvement Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-purple-700 leading-relaxed">{improvementResult.summary}</p>
                      </CardContent>
                    </Card>

                    {/* Changes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Detailed Changes</h3>
                      {improvementResult.changedSections.map((change, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-400 shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-3">
                                <Badge className={`${getChangeTypeColor(change.type)} text-xs px-2 py-1`}>
                                  {change.type}
                                </Badge>
                                <span className="font-medium text-slate-900">{change.technique}</span>
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-4">
                            <p className="text-sm text-slate-700 leading-relaxed">{change.description}</p>
                            
                            {change.before !== 'not present' && (
                              <div className="space-y-3">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Before
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                  <div className="text-sm text-red-800 whitespace-pre-wrap font-sans leading-relaxed break-words max-h-32 overflow-y-auto">
                                    {change.before}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-center py-2">
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                After
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <div className="text-sm text-green-800 whitespace-pre-wrap font-sans leading-relaxed break-words max-h-32 overflow-y-auto">
                                  {change.after}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t gap-4">
          <div className="text-sm text-slate-600">
            This will create a new version of your prompt
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isApplying}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isApplying} className="bg-purple-600 hover:bg-purple-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApplying ? 'Applying...' : 'Apply Improvement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptImprovementModal;
