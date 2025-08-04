
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDefaultProject = async () => {
    if (!user?.id) return;

    try {
      console.log('useProjects: Creating default project for user:', user.id);
      const { error } = await supabase.rpc('create_default_project', { user_id: user.id });
      
      if (error) {
        console.error('useProjects: Error creating default project:', error);
        throw error;
      }

      console.log('useProjects: Default project created successfully');
    } catch (error: any) {
      console.error('useProjects: Failed to create default project:', error);
    }
  };

  const fetchProjects = async (isRetry = false) => {
    if (!user?.id) {
      console.log('useProjects: No user ID, clearing projects');
      setProjects([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`useProjects: ${isRetry ? 'Retrying' : 'Starting'} to fetch projects for user:`, user.id);
    setIsLoading(true);
    setError(null);
    
    let timeoutId: NodeJS.Timeout;
    let fetchCompleted = false;

    try {
      console.log('useProjects: Calling get_accessible_projects RPC');
      
      timeoutId = setTimeout(() => {
        if (!fetchCompleted) {
          console.log('useProjects: Fetch timed out after 10 seconds');
          setError('Request timed out - please try again');
          setIsLoading(false);
        }
      }, 10000);

      const { data, error } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      
      fetchCompleted = true;
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('useProjects: Error fetching accessible projects:', error);
        setError(error.message);
        setProjects([]);
        
        toast({
          title: "Error loading projects",
          description: "Unable to load projects. You can still create new ones.",
          variant: "destructive",
        });
      } else {
        console.log('useProjects: Successfully fetched projects:', data?.length || 0, 'projects');
        
        // Filter to only show owned projects (not reviewer projects)
        const ownedProjects = data?.filter(p => p.access_type === 'owner') || [];
        
        // If user has no owned projects, create a default one
        if (ownedProjects.length === 0) {
          console.log('useProjects: No owned projects found, creating default project');
          await createDefaultProject();
          
          // Refetch projects after creating default one
          const { data: newData, error: refetchError } = await supabase
            .rpc('get_accessible_projects', { user_id: user.id });
          
          if (!refetchError && newData) {
            console.log('useProjects: Refetched projects after creating default:', newData.length, 'projects');
            const newOwnedProjects = newData.filter(p => p.access_type === 'owner') || [];
            setProjects(newOwnedProjects);
          } else {
            setProjects([]);
          }
        } else {
          setProjects(ownedProjects);
        }
        
        setError(null);
      }
    } catch (err: any) {
      fetchCompleted = true;
      clearTimeout(timeoutId!);
      console.error('useProjects: Failed to fetch projects:', err);
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      setProjects([]);
      
      toast({
        title: "Error loading projects",
        description: "Unable to load projects. You can still create new ones.",
        variant: "destructive",
      });
    } finally {
      if (fetchCompleted) {
        console.log('useProjects: Fetch completed, setting loading to false');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id, toast]);

  const retryFetch = () => {
    console.log('useProjects: Retrying fetch');
    fetchProjects(true);
  };

  const createProject = async (name: string, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });

      // Refetch projects
      const { data } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      const ownedProjects = data?.filter(p => p.access_type === 'owner') || [];
      setProjects(ownedProjects);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const updateProject = async (id: string, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name,
          description,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });

      // Refetch projects
      const { data } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      const ownedProjects = data?.filter(p => p.access_type === 'owner') || [];
      setProjects(ownedProjects);
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });

      // Refetch projects
      const { data } = await supabase
        .rpc('get_accessible_projects', { user_id: user.id });
      const ownedProjects = data?.filter(p => p.access_type === 'owner') || [];
      setProjects(ownedProjects);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    retryFetch,
  };
};
