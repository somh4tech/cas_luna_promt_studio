
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();

  // Fetch project name if we're on a project page
  const { data: project } = useQuery({
    queryKey: ['project', params.projectId],
    queryFn: async () => {
      if (!params.projectId || !user?.id) return null;
      
      const { data } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      
      return data?.find(p => p.id === params.projectId) || null;
    },
    enabled: !!params.projectId && !!user?.id,
  });

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [];

    // Handle different route patterns
    if (path === '/') {
      return [{ label: 'Home', isCurrentPage: true }];
    }

    if (path === '/dashboard') {
      return [{ label: 'Dashboard', isCurrentPage: true }];
    }

    if (path.startsWith('/project/')) {
      items.push({ label: 'Dashboard', href: '/dashboard' });
      const projectName = project?.name || 'Project';
      items.push({ label: projectName, isCurrentPage: true });
      return items;
    }

    if (path.startsWith('/admin')) {
      items.push({ label: 'Dashboard', href: '/dashboard' });
      
      if (path === '/admin') {
        items.push({ label: 'Admin', isCurrentPage: true });
      } else if (path === '/admin/users') {
        items.push({ label: 'Admin', href: '/admin' });
        items.push({ label: 'Users', isCurrentPage: true });
      } else if (path === '/admin/projects') {
        items.push({ label: 'Admin', href: '/admin' });
        items.push({ label: 'Projects', isCurrentPage: true });
      }
      return items;
    }

    if (path.startsWith('/review/')) {
      return [{ label: 'Review', isCurrentPage: true }];
    }

    // Default fallback
    return [{ label: 'Dashboard', href: '/dashboard' }];
  }, [location.pathname, project?.name]);

  return breadcrumbs;
};
