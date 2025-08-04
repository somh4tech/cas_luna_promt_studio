
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, Edit } from 'lucide-react';

interface PromptEditorHeaderProps {
  title: string;
  status: string;
  isPreviewMode: boolean;
  onTitleChange: (title: string) => void;
  onTogglePreview: () => void;
  readOnly?: boolean;
}

const PromptEditorHeader = ({
  title,
  status,
  isPreviewMode,
  onTitleChange,
  onTogglePreview,
  readOnly = false
}: PromptEditorHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex-1">
        <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
        {readOnly ? (
          <div className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-gray-50 text-sm">
            {title}
          </div>
        ) : (
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(status)}>
          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
          >
            {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PromptEditorHeader;
