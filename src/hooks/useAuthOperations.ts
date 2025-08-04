
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthOperations: Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthOperations: Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('AuthOperations: Sign in successful');
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('AuthOperations: Sign in exception:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('AuthOperations: Attempting sign up for:', email);

      // Remove emailRedirectTo to avoid email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('AuthOperations: Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('AuthOperations: Sign up successful');
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('AuthOperations: Sign up exception:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthOperations: Signing out user...');
      
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error: any) {
      console.error('AuthOperations: Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { signIn, signUp, signOut };
};
