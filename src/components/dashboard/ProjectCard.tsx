
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Edit, Trash2, MoreHorizontal, Users } from 'lucide-react';

interface ProjectCardProps {
  project: any;
  onProjectClick: (projectId: string) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
  isReviewProject?: boolean;
}

const ProjectCard = ({ project, onProjectClick, onEditProject, onDeleteProject, isReviewProject = false }: ProjectCardProps) => {
  const handleCardContentClick = () => {
    onProjectClick(project.id);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow relative ${isReviewProject ? 'border-blue-200' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleCardContentClick}
          >
            {isReviewProject ? (
              <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
            ) : (
              <FolderOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
            )}
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            {isReviewProject && (
              <Badge variant="secondary" className="ml-auto">
                Reviewer
              </Badge>
            )}
          </div>
          {!isReviewProject && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onProjectClick(project.id)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEditProject(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteProject(project)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div 
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleCardContentClick}
        >
          <CardDescription>{project.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent 
        className="cursor-pointer hover:text-blue-600 transition-colors"
        onClick={handleCardContentClick}
      >
        <p className="text-sm text-gray-500">
          {isReviewProject ? 'Invited to review • ' : ''}
          Created {new Date(project.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
