
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EditProjectDialogProps {
  project: {
    id: string;
    name: string;
    description: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProjectDialog = ({ project, open, onOpenChange }: EditProjectDialogProps) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
      console.log('EditProjectDialog: Updating project:', id, name);
      
      const { error } = await supabase
        .from('projects')
        .update({
          name,
          description,
        })
        .eq('id', id);

      if (error) {
        console.error('EditProjectDialog: Error updating project:', error);
        throw error;
      }

      console.log('EditProjectDialog: Project updated successfully');
    },
    onSuccess: () => {
      console.log('EditProjectDialog: Invalidating queries after successful update');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('EditProjectDialog: Mutation error:', error);
      toast({
        title: "Error updating project",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    console.log('EditProjectDialog: Submitting project update:', project.id, projectName);
    updateProjectMutation.mutate({
      id: project.id,
      name: projectName,
      description: projectDescription,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-admin-project-name">Project Name</Label>
            <Input
              id="edit-admin-project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-admin-project-description">Description (optional)</Label>
            <Textarea
              id="edit-admin-project-description"
              placeholder="Describe the project"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
