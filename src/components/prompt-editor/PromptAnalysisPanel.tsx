
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptAnalysisPanelProps {
  content: string;
  searchTerm: string;
}

const PromptAnalysisPanel = ({ content, searchTerm }: PromptAnalysisPanelProps) => {
  return (
    <div className="h-full p-4 bg-gray-50 flex flex-col">
      <h3 className="text-sm font-medium mb-2 flex-shrink-0">Prompt Analysis</h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Characters: {content.length}</div>
              <div>Lines: {content.split('\n').length}</div>
              <div>Words: {content.split(/\s+/).filter(w => w).length}</div>
              <div>Paragraphs: {content.split(/\n\s*\n/).filter(p => p.trim()).length}</div>
            </div>
          </CardContent>
        </Card>
        
        {searchTerm && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Search Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs">
                {(content.match(new RegExp(searchTerm, 'gi')) || []).length} matches found
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromptAnalysisPanel;
