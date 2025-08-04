
import { useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectsSection from '@/components/dashboard/ProjectsSection';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

const Dashboard = () => {
  const { user, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading, error: projectsError, createProject, updateProject, deleteProject, retryFetch } = useProjects();

  // Redirect if not authenticated after auth is initialized
  useEffect(() => {
    if (initialized && !user) {
      console.log('Dashboard: No user found after auth initialized, redirecting to auth');
      navigate('/auth');
    }
  }, [user, initialized, navigate]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // Show loading only while auth is initializing (not for projects)
  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect via useEffect)
  if (!user) {
    return null;
  }

  // Always render dashboard content, even if projects are loading or failed
  return (
    <DashboardLayout>
      {projectsLoading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projectsError ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <p className="text-red-600 mb-2">Error loading projects</p>
            <p className="text-gray-600 text-sm">{projectsError}</p>
          </div>
          <button 
            onClick={retryFetch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <ProjectsSection
          projects={projects}
          onProjectClick={handleProjectClick}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
