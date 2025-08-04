
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, AlertCircle } from 'lucide-react';

interface ProjectHeaderProps {
  project: any;
  userAccessType: string;
  invitationToken: string | null;
  hasInteractedWithHighlight: boolean;
  canCreatePrompts: boolean;
  onCreatePromptClick: () => void;
}

const ProjectHeader = ({
  project,
  userAccessType,
  invitationToken,
  hasInteractedWithHighlight,
  canCreatePrompts,
  onCreatePromptClick
}: ProjectHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
                alt="Cascade Prompt Studio" 
                className="h-8 w-auto cursor-pointer"
                onClick={() => navigate('/dashboard')}
              />
              <span className="text-xl font-bold text-gray-900">Cascade Prompt Studio</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                Beta
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {userAccessType === 'reviewer' && (
                <Users className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
                {project?.description && (
                  <p className="text-sm text-gray-600">{project.description}</p>
                )}
              </div>
              {userAccessType === 'reviewer' && (
                <Badge variant="secondary">Reviewer Access</Badge>
              )}
            </div>
          </div>
          
          {/* Welcome message for new reviewers - only show if user hasn't interacted */}
          {invitationToken && userAccessType === 'reviewer' && !hasInteractedWithHighlight && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Welcome! Please review the highlighted prompt below
              </span>
            </div>
          )}
          
          {canCreatePrompts && (
            <Button onClick={onCreatePromptClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
