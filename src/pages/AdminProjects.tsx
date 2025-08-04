import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, FolderOpen, Edit, Trash2 } from 'lucide-react';
import EditProjectDialog from '@/components/admin/EditProjectDialog';
import DeleteProjectDialog from '@/components/admin/DeleteProjectDialog';

interface ProjectWithDetails {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_email: string;
  owner_name: string;
  prompt_count: number;
  invitation_count: number;
}

const AdminProjects = () => {
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithDetails | null>(null);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async (): Promise<ProjectWithDetails[]> => {
      try {
        console.log('AdminProjects: Starting to fetch projects');

        // First get all projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description, created_at, updated_at, user_id')
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('AdminProjects: Error fetching projects:', projectsError);
          throw projectsError;
        }

        console.log('AdminProjects: Fetched projects:', projectsData?.length || 0);

        if (!projectsData || projectsData.length === 0) {
          return [];
        }

        // Get all unique user IDs
        const userIds = [...new Set(projectsData.map(p => p.user_id))];
        console.log('AdminProjects: Unique user IDs:', userIds.length);

        // Get profiles for all users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profilesError) {
          console.error('AdminProjects: Error fetching profiles:', profilesError);
          // Don't throw here, continue with empty profiles
        }

        console.log('AdminProjects: Fetched profiles:', profilesData?.length || 0);

        // Get prompt and invitation counts for all projects in bulk
        const projectIds = projectsData.map(p => p.id);
        
        const [promptCountsResult, invitationCountsResult] = await Promise.all([
          supabase
            .from('prompts')
            .select('project_id')
            .in('project_id', projectIds),
          supabase
            .from('review_invitations')
            .select('prompt_id, prompts!inner(project_id)')
            .in('prompts.project_id', projectIds)
        ]);

        // Count prompts by project
        const promptCounts: Record<string, number> = {};
        if (promptCountsResult.data) {
          promptCountsResult.data.forEach(prompt => {
            promptCounts[prompt.project_id] = (promptCounts[prompt.project_id] || 0) + 1;
          });
        }

        // Count invitations by project
        const invitationCounts: Record<string, number> = {};
        if (invitationCountsResult.data) {
          invitationCountsResult.data.forEach(invitation => {
            const projectId = (invitation.prompts as any)?.project_id;
            if (projectId) {
              invitationCounts[projectId] = (invitationCounts[projectId] || 0) + 1;
            }
          });
        }

        // Combine all data
        const projectsWithDetails = projectsData.map(project => {
          const profile = profilesData?.find(p => p.id === project.user_id);
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            created_at: project.created_at,
            updated_at: project.updated_at,
            user_id: project.user_id,
            owner_email: profile?.email || 'Unknown',
            owner_name: profile?.full_name || 'No name',
            prompt_count: promptCounts[project.id] || 0,
            invitation_count: invitationCounts[project.id] || 0,
          };
        });

        console.log('AdminProjects: Final projects with details:', projectsWithDetails.length);
        return projectsWithDetails;

      } catch (error) {
        console.error('AdminProjects: Query failed:', error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading projects</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
        <p className="text-gray-600 mt-2">View and manage all projects in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            All Projects ({projects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Prompts</TableHead>
                <TableHead>Invitations</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.owner_name}</p>
                      <p className="text-sm text-gray-500">{project.owner_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {project.prompt_count} prompts
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {project.invitation_count} invitations
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/project/${project.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingProject(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!projects?.length && (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProjectDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      />
    </div>
  );
};

export default AdminProjects;
