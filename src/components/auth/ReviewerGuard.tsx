
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Loader2 } from 'lucide-react';

interface ReviewerGuardProps {
  children: React.ReactNode;
}

const ReviewerGuard = ({ children }: ReviewerGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check if user has any owned projects
  const { data: ownedProjects, error: projectsError } = useQuery({
    queryKey: ['user-owned-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
  });

  // Check if user has any pending review invitations
  const { data: reviewInvitations, error: invitationsError } = useQuery({
    queryKey: ['user-review-invitations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('review_invitations')
        .select('id, prompt_id, status')
        .eq('reviewer_id', user.id)
        .in('status', ['sent', 'accepted']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
  });

  useEffect(() => {
    if (user && ownedProjects !== undefined && reviewInvitations !== undefined) {
      setIsCheckingAccess(false);
      
      // If user has no owned projects but has review invitations,
      // they should only access review pages
      const hasOwnedProjects = ownedProjects.length > 0;
      const hasReviewInvitations = reviewInvitations.length > 0;
      
      if (!hasOwnedProjects && hasReviewInvitations) {
        // User is purely a reviewer - redirect them away from project pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard') || currentPath.includes('/project/')) {
          // Redirect to the first available review invitation
          navigate('/'); // Or redirect to a reviewer dashboard if you create one
        }
      }
    }

    // Handle errors by stopping the loading state
    if (projectsError || invitationsError) {
      console.error('ReviewerGuard: Error fetching data', { projectsError, invitationsError });
      setIsCheckingAccess(false);
    }
  }, [user, ownedProjects, reviewInvitations, projectsError, invitationsError, navigate]);

  // Add timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isCheckingAccess) {
        console.warn('ReviewerGuard: Timeout reached, stopping loading state');
        setIsCheckingAccess(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isCheckingAccess]);

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ReviewerGuard;
