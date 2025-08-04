
import { Button } from '@/components/ui/button';
import { Search, Copy } from 'lucide-react';

interface PromptEditorToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  content: string;
}

const PromptEditorToolbar = ({
  searchTerm,
  onSearchChange,
  content
}: PromptEditorToolbarProps) => {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search in prompt..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(content)}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PromptEditorToolbar;
