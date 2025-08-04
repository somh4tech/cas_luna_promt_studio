
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

interface DeleteUserDialogProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteUserDialog = ({ user, open, onOpenChange }: DeleteUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('DeleteUserDialog: Starting user deletion for:', userId);
      
      try {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });

        if (error) {
          console.error('DeleteUserDialog: Edge function error:', error);
          throw new Error(error.message || 'Failed to delete user via edge function');
        }

        if (data?.error) {
          console.error('DeleteUserDialog: Response error:', data.error);
          throw new Error(data.error);
        }

        console.log('DeleteUserDialog: User deletion successful:', data);
        return data;
      } catch (error) {
        console.error('DeleteUserDialog: Exception during deletion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('DeleteUserDialog: Invalidating queries after successful deletion');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully from all systems.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('DeleteUserDialog: Mutation error:', error);
      const errorMessage = error.message || 'An unexpected error occurred while deleting the user';
      
      toast({
        title: "Error deleting user",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!user) {
      console.error('DeleteUserDialog: No user provided for deletion');
      return;
    }
    
    console.log('DeleteUserDialog: Initiating deletion for user:', user.email, 'ID:', user.id);
    deleteUserMutation.mutate(user.id);
  };

  if (!user) return null;

  // Prevent deleting admin users
  const isAdmin = user.role === 'admin';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            {isAdmin ? (
              <>
                Cannot delete admin users. Please change the user's role first if you want to remove their admin privileges.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{user.full_name || user.email}</strong>? 
                This action cannot be undone and will permanently remove the user's account from all systems, including authentication, profile data, and role assignments.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isAdmin && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
