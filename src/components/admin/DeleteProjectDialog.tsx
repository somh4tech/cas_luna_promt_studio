
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface DeleteProjectDialogProps {
  project: {
    id: string;
    name: string;
    prompt_count: number;
    invitation_count: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteProjectDialog = ({ project, open, onOpenChange }: DeleteProjectDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log('DeleteProjectDialog: Starting project deletion for:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('DeleteProjectDialog: Error deleting project:', error);
        throw error;
      }

      console.log('DeleteProjectDialog: Project deletion successful');
    },
    onSuccess: () => {
      console.log('DeleteProjectDialog: Invalidating queries after successful deletion');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('DeleteProjectDialog: Mutation error:', error);
      const errorMessage = error.message || 'An unexpected error occurred while deleting the project';
      
      toast({
        title: "Error deleting project",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!project) {
      console.error('DeleteProjectDialog: No project provided for deletion');
      return;
    }
    
    console.log('DeleteProjectDialog: Initiating deletion for project:', project.name, 'ID:', project.id);
    deleteProjectMutation.mutate(project.id);
  };

  if (!project) return null;

  const hasContent = project.prompt_count > 0 || project.invitation_count > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project.name}</strong>? 
            {hasContent && (
              <>
                <br /><br />
                This project contains:
                <ul className="list-disc list-inside mt-2">
                  {project.prompt_count > 0 && <li>{project.prompt_count} prompt(s)</li>}
                  {project.invitation_count > 0 && <li>{project.invitation_count} invitation(s)</li>}
                </ul>
                <br />
                All associated data will be permanently deleted.
              </>
            )}
            <br /><br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProjectMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectDialog;
