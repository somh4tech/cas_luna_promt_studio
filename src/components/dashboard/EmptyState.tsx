
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateProject: () => void;
}

const EmptyState = ({ onCreateProject }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
      <p className="text-gray-600 mb-4">Create your first project to start organizing your prompts</p>
      <Button onClick={onCreateProject}>
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Project
      </Button>
    </div>
  );
};

export default EmptyState;
