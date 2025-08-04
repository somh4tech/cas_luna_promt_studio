
import { Label } from '@/components/ui/label';
import { ResizableTextarea } from '@/components/ui/resizable-textarea';

interface PromptContentPanelProps {
  content: string;
  isPreviewMode: boolean;
  searchTerm: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

const PromptContentPanel = ({
  content,
  isPreviewMode,
  searchTerm,
  onContentChange,
  readOnly = false
}: PromptContentPanelProps) => {
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <Label htmlFor="edit-content" className="text-sm font-medium flex-shrink-0">
        Prompt Content
        <span className="text-xs text-gray-500 ml-2">
          {content.length} characters | {content.split('\n').length} lines
        </span>
      </Label>
      <div className="mt-2 flex-1 min-h-0">
        {isPreviewMode || readOnly ? (
          <div className="h-full overflow-y-auto border rounded-md p-3 bg-gray-50">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {highlightSearchTerm(content)}
            </pre>
          </div>
        ) : (
          <div className="h-full">
            <ResizableTextarea
              id="edit-content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              minRows={8}
              maxRows={25}
              className="h-full font-mono text-sm leading-relaxed resize-none"
              placeholder="Enter your prompt content here..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptContentPanel;
