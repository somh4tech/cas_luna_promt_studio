
import ProjectCard from './ProjectCard';

interface ProjectsGridProps {
  projects: any[];
  onProjectClick: (projectId: string) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
  isReviewProjects?: boolean;
}

const ProjectsGrid = ({ projects, onProjectClick, onEditProject, onDeleteProject, isReviewProjects = false }: ProjectsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectClick={onProjectClick}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          isReviewProject={isReviewProjects}
        />
      ))}
    </div>
  );
};

export default ProjectsGrid;
