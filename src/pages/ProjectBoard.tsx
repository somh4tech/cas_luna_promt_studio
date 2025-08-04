import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

import ProductionPromptModal from '@/components/ProductionPromptModal';
import ProjectHeader from '@/components/project/ProjectHeader';
import KanbanBoard from '@/components/project/KanbanBoard';
import CreatePromptDialog from '@/components/project/CreatePromptDialog';
import SearchFilterToolbar from '@/components/project/SearchFilterToolbar';
import PromptsTableView from '@/components/project/PromptsTableView';
import AppBreadcrumbs from '@/components/navigation/AppBreadcrumbs';
import { usePromptFiltering } from '@/hooks/usePromptFiltering';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  // Check for invitation context
  const invitationToken = searchParams.get('invitation');
  const highlightPromptId = searchParams.get('prompt');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [hasInteractedWithHighlight, setHasInteractedWithHighlight] = useState(false);

  // Check if user has access to this project using the secure function
  const { data: accessibleProjects } = useQuery({
    queryKey: ['accessible-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get the current project from accessible projects
  const project = accessibleProjects?.find(p => p.id === projectId);
  const userAccessType = project?.access_type;

  const { data: prompts } = useQuery({
    queryKey: ['prompts', projectId],
    queryFn: async () => {
      if (!project) return [];
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!project,
  });

  // Add prompt filtering hook
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filteredAndSortedPrompts,
    activeFiltersCount,
    clearFilters
  } = usePromptFiltering({ prompts });

  // Show welcome message for new reviewers
  useEffect(() => {
    if (invitationToken && highlightPromptId && prompts && !hasShownWelcome && userAccessType === 'reviewer' && !hasInteractedWithHighlight) {
      const targetPrompt = prompts.find(p => p.id === highlightPromptId);
      if (targetPrompt) {
        toast({
          title: "Welcome to the project! 🎉",
          description: `Please review the highlighted prompt: "${targetPrompt.title}"`,
          duration: 5000,
        });
        setHasShownWelcome(true);
        
        // Scroll to the highlighted prompt after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`prompt-${highlightPromptId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [invitationToken, highlightPromptId, prompts, hasShownWelcome, userAccessType, toast, hasInteractedWithHighlight]);

  const createPromptMutation = useMutation({
    mutationFn: async (promptData: any) => {
      const { error } = await supabase
        .from('prompts')
        .insert(promptData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts', projectId] });
      toast({
        title: "Prompt created",
        description: "Your new prompt has been added to the board.",
      });
      setIsCreateOpen(false);
    },
  });

  const handleCreatePrompt = async (title: string, content: string) => {
    createPromptMutation.mutate({
      title,
      content,
      project_id: projectId,
      user_id: user?.id,
      status: 'in_progress',
    });
  };

  // Redirect if user doesn't have access to this project
  if (accessibleProjects && !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to view this project.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while checking access
  if (!accessibleProjects) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const canCreatePrompts = userAccessType === 'owner';

  const handlePromptClick = (prompt: any) => {
    // Clear highlighting if this is the highlighted prompt
    if (invitationToken && highlightPromptId === prompt.id && !hasInteractedWithHighlight) {
      setHasInteractedWithHighlight(true);
    }
    
    // Navigate to prompt edit page with search params preserved
    const searchParamsString = searchParams.toString();
    const queryString = searchParamsString ? `?${searchParamsString}` : '';
    
    if (prompt.status === 'in_production') {
      // For production prompts, still use the modal for now
      setSelectedPrompt(prompt);
    } else {
      // Navigate to the prompt page, defaulting to edit tab for reviewers or reviews tab
      const defaultTab = invitationToken ? 'reviews' : 'edit';
      navigate(`/project/${projectId}/prompt/${prompt.id}/${defaultTab}${queryString}`);
    }
  };

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-slate-50">
        <ProjectHeader
          project={project}
          userAccessType={userAccessType}
          invitationToken={invitationToken}
          hasInteractedWithHighlight={hasInteractedWithHighlight}
          canCreatePrompts={canCreatePrompts}
          onCreatePromptClick={() => setIsCreateOpen(true)}
        />
        
        <AppBreadcrumbs />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Toolbar */}
          <SearchFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
          />

          {/* Content based on view mode */}
          {viewMode === 'kanban' ? (
            <KanbanBoard
              prompts={filteredAndSortedPrompts}
              canCreatePrompts={canCreatePrompts}
              invitationToken={invitationToken}
              highlightPromptId={highlightPromptId}
              hasInteractedWithHighlight={hasInteractedWithHighlight}
              onPromptClick={handlePromptClick}
              onCreatePromptClick={() => setIsCreateOpen(true)}
            />
          ) : (
            <PromptsTableView
              prompts={filteredAndSortedPrompts}
              highlightPromptId={highlightPromptId}
              hasInteractedWithHighlight={hasInteractedWithHighlight}
              invitationToken={invitationToken}
              onPromptClick={handlePromptClick}
            />
          )}
        </main>

        {/* Create Prompt Dialog */}
        <CreatePromptDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreatePrompt}
          isCreating={createPromptMutation.isPending}
        />

        {/* Production Prompt Modal - keep for production prompts */}
        {selectedPrompt && selectedPrompt.status === 'in_production' && (
          <ProductionPromptModal
            prompt={selectedPrompt}
            isOpen={!!selectedPrompt}
            onClose={() => setSelectedPrompt(null)}
          />
        )}
      </div>
    </AnalysisProvider>
  );
};

export default ProjectBoard;
