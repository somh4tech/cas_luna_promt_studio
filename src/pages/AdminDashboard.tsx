
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderOpen, FileText, Mail } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalPrompts: number;
  totalInvitations: number;
  recentUsers: Array<{
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    role: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
    user_email: string;
  }>;
  recentInvitations: Array<{
    id: string;
    reviewer_email: string;
    status: string;
    created_at: string;
    prompt_title: string;
  }>;
}

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch total counts
      const [usersCount, projectsCount, promptsCount, invitationsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('prompts').select('*', { count: 'exact', head: true }),
        supabase.from('review_invitations').select('*', { count: 'exact', head: true }),
      ]);

      // Fetch recent users with roles
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_roles!inner(role)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent projects with user info
      const { data: recentProjectsData } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent invitations with prompt info
      const { data: recentInvitationsData } = await supabase
        .from('review_invitations')
        .select(`
          id,
          reviewer_email,
          status,
          created_at,
          prompts!inner(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        totalUsers: usersCount.count || 0,
        totalProjects: projectsCount.count || 0,
        totalPrompts: promptsCount.count || 0,
        totalInvitations: invitationsCount.count || 0,
        recentUsers: recentUsersData?.map(user => ({
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          created_at: user.created_at,
          role: (user.user_roles as any)?.role || 'user'
        })) || [],
        recentProjects: recentProjectsData?.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          created_at: project.created_at,
          user_email: (project.profiles as any)?.email || ''
        })) || [],
        recentInvitations: recentInvitationsData?.map(invitation => ({
          id: invitation.id,
          reviewer_email: invitation.reviewer_email,
          status: invitation.status,
          created_at: invitation.created_at,
          prompt_title: (invitation.prompts as any)?.title || ''
        })) || []
      };
    },
    retry: 2,
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
      <div className="text-center py-8">
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and recent activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPrompts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvitations || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {!stats?.recentUsers?.length && (
                <p className="text-gray-500 text-sm text-center py-4">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Latest project creations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentProjects?.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-500">by {project.user_email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {!stats?.recentProjects?.length && (
                <p className="text-gray-500 text-sm text-center py-4">No recent projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Review Invitations</CardTitle>
          <CardDescription>Latest review invitation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recentInvitations?.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{invitation.prompt_title}</p>
                  <p className="text-sm text-gray-500">to {invitation.reviewer_email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    invitation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invitation.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {!stats?.recentInvitations?.length && (
              <p className="text-gray-500 text-sm text-center py-4">No recent invitations</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
