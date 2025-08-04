import { useParams, useNavigate, useSearchParams, NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Play, History, UserPlus, Eye, Check, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMarkAsReviewed } from '@/hooks/useMarkAsReviewed';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

const PromptLayout = () => {
  const { projectId, promptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const markAsReviewedMutation = useMarkAsReviewed();

  // Check for invitation context
  const invitationToken = searchParams.get('invitation');
  const invitationId = searchParams.get('invitationId');
  const isReviewerMode = !!invitationToken;

  // Get prompt data
  const { data: prompt, isLoading } = useQuery({
    queryKey: ['prompt', promptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!promptId,
  });

  // Get project data for breadcrumbs
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Prompt Not Found</h1>
          <p className="text-gray-600 mb-6">The prompt you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/project/${projectId}`)}>
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === prompt.user_id;

  const handleMarkAsReviewed = () => {
    if (invitationId && invitationToken) {
      markAsReviewedMutation.mutate({
        invitationId,
        invitationToken,
      });
      navigate(`/project/${projectId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_production':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/project/${projectId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            
            {isReviewerMode && (
              <Button
                onClick={handleMarkAsReviewed}
                disabled={markAsReviewedMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {markAsReviewedMutation.isPending ? 'Marking...' : 'Mark as Reviewed'}
              </Button>
            )}
          </div>

          {/* Manual breadcrumbs for now */}
          <nav className="text-sm text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span>{project?.name || 'Project'}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{prompt.title}</span>
          </nav>

          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(prompt.status)}>
                  {prompt.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Version {prompt.version}
                </span>
              </div>
            </div>

            {isOwner && !isReviewerMode && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Request Review
                </Button>
                <Button variant="outline" size="sm">
                  Mark Complete
                </Button>
              </div>
            )}
          </div>

          <Tabs value={window.location.pathname.split('/').pop() || 'edit'} className="mt-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger 
                value="edit" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/edit${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isOwner ? 'Edit' : 'View Prompt'}
                </NavLink>
              </TabsTrigger>
              <TabsTrigger 
                value="analyze" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/analyze${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Analyze
                </NavLink>
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/comments${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </NavLink>
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/reviews${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Reviews
                </NavLink>
              </TabsTrigger>
              <TabsTrigger 
                value="test" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/test${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Test
                </NavLink>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                asChild
              >
                <NavLink 
                  to={`/project/${projectId}/prompt/${promptId}/history${window.location.search}`}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </NavLink>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ prompt, isOwner, isReviewerMode, invitationId, invitationToken }} />
      </main>
    </div>
    </AnalysisProvider>
  );
};

export default PromptLayout;