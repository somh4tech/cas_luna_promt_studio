
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';
import DeleteProjectDialog from './DeleteProjectDialog';
import ProjectsGrid from './ProjectsGrid';
import PromptCard from './PromptCard';
import EmptyState from './EmptyState';
import { useReviewPrompts } from '@/hooks/useReviewPrompts';

interface ProjectsSectionProps {
  projects: any[];
  onProjectClick: (projectId: string) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
  onUpdateProject: (id: string, name: string, description: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

const ProjectsSection = ({ 
  projects, 
  onProjectClick, 
  onCreateProject, 
  onUpdateProject, 
  onDeleteProject 
}: ProjectsSectionProps) => {
  const navigate = useNavigate();
  const { reviewPrompts, isLoading: reviewPromptsLoading } = useReviewPrompts();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setIsEditOpen(true);
  };

  const handleDeleteProject = (project: any) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const handleUpdateProject = async (id: string, name: string, description: string) => {
    await onUpdateProject(id, name, description);
    setEditingProject(null);
  };

  const handleConfirmDelete = async (id: string) => {
    await onDeleteProject(id);
    setDeletingProject(null);
  };

  const handleCreateProject = () => {
    // This will be handled by the CreateProjectDialog trigger
  };

  const handlePromptClick = (invitationToken: string) => {
    navigate(`/review/${invitationToken}`);
  };

  // Separate projects by access type (only owned projects now)
  const ownedProjects = projects?.filter(p => p.access_type === 'owner') || [];

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600 mt-2">Organize your prompts into collaborative projects</p>
        </div>
        <CreateProjectDialog 
          onCreateProject={onCreateProject}
          isLoading={false}
        />
      </div>

      <EditProjectDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        project={editingProject}
        onUpdateProject={handleUpdateProject}
        isLoading={false}
      />

      <DeleteProjectDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={deletingProject}
        onDeleteProject={handleConfirmDelete}
        isLoading={false}
      />

      {/* Owned Projects Section */}
      {ownedProjects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Projects</h3>
          <ProjectsGrid
            projects={ownedProjects}
            onProjectClick={onProjectClick}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      )}

      {/* Review Prompts Section */}
      {reviewPrompts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Prompts To Review
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({reviewPrompts.length} prompt{reviewPrompts.length !== 1 ? 's' : ''})
            </span>
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            These prompts have been shared with you for review. Click on any prompt to provide feedback or use the "Reviewed" button to mark them as complete.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onPromptClick={handlePromptClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading state for review prompts */}
      {reviewPromptsLoading && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Prompts To Review</h3>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading review prompts...</p>
          </div>
        </div>
      )}

      {/* Empty State - Show when user has no projects at all */}
      {(!projects || projects.length === 0) && reviewPrompts.length === 0 && !reviewPromptsLoading && (
        <EmptyState onCreateProject={handleCreateProject} />
      )}

      {/* Welcome message for users who only have review prompts */}
      {reviewPrompts.length > 0 && ownedProjects.length === 0 && (
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-900 mb-2">Welcome to Prompt Studio!</h4>
          <p className="text-purple-800 mb-3">
            You've been invited to review {reviewPrompts.length} prompt{reviewPrompts.length !== 1 ? 's' : ''}. 
            You can explore the prompts above and provide valuable feedback to help improve them.
          </p>
          <p className="text-purple-700 text-sm">
            Want to create your own projects? Click "Create Project" above to get started with your own prompt library.
          </p>
        </div>
      )}
    </>
  );
};

export default ProjectsSection;
