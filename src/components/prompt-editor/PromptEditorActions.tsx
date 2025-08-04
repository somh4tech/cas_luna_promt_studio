
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';

interface PromptEditorActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const PromptEditorActions = ({ onSave, onCancel, isSaving }: PromptEditorActionsProps) => {
  return (
    <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
      <div className="text-xs text-gray-500">
        Ctrl+S to save • Ctrl+F to search
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default PromptEditorActions;
