import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'user' | 'moderator';

interface SimpleAuthState {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  roleLoading: boolean;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  refreshUserRole: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthState | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  const isAdmin = userRole === 'admin';

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      setRoleLoading(true);
      console.log('SimpleAuth: Fetching user role for:', userId);
      
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), 10000);
      });
      
      const rolePromise = supabase.rpc('get_user_role', { _user_id: userId });
      
      const { data, error } = await Promise.race([rolePromise, timeoutPromise]);
      
      if (error) {
        console.error('Error fetching user role:', error);
        // Retry once after a short delay
        console.log('SimpleAuth: Retrying role fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryData, error: retryError } = await supabase.rpc('get_user_role', { _user_id: userId });
        if (retryError) {
          console.error('Retry failed for user role:', retryError);
          return 'user'; // Default to 'user' role on error
        }
        console.log('SimpleAuth: Retry successful, user role:', retryData);
        return retryData as UserRole;
      }
      
      console.log('SimpleAuth: User role fetched successfully:', data);
      return data as UserRole;
    } catch (error) {
      console.error('Exception fetching user role:', error);
      return 'user'; // Default to 'user' role on error
    } finally {
      setRoleLoading(false);
    }
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      const role = await fetchUserRole(user.id);
      setUserRole(role);
      console.log('SimpleAuth: Role refreshed:', role, 'isAdmin will be:', role === 'admin');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('SimpleAuth: Starting password reset process');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=recovery`,
      });
      
      if (error) {
        console.error('SimpleAuth: Password reset error:', error);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SimpleAuth: Password reset email sent');
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SimpleAuth: Password reset exception:', error);
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      console.log('SimpleAuth: Updating password');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('SimpleAuth: Password update error:', error);
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SimpleAuth: Password updated successfully');
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SimpleAuth: Password update exception:', error);
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SimpleAuth: Starting sign in process');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SimpleAuth: Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SimpleAuth: Sign in successful');
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SimpleAuth: Sign in exception:', error);
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
      console.log('SimpleAuth: Starting sign up process');

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
        console.error('SimpleAuth: Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SimpleAuth: Sign up successful');
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SimpleAuth: Sign up exception:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('SimpleAuth: Starting Google sign in process');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        console.error('SimpleAuth: Google sign in error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('SimpleAuth: Google sign in initiated');
      return { error: null };
    } catch (error: any) {
      console.error('SimpleAuth: Google sign in exception:', error);
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('SimpleAuth: Starting sign out process');
      setSigningOut(true);
      
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });

      // Immediate redirect to landing page
      console.log('SimpleAuth: Redirecting to landing page');
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('SimpleAuth: Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    console.log('SimpleAuth: Setting up auth listener');
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('SimpleAuth: Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);

        // Fetch user role when user signs in
        if (session?.user?.id) {
          console.log('SimpleAuth: User signed in, fetching role...');
          fetchUserRole(session.user.id).then(role => {
            if (mounted) {
              setUserRole(role);
              console.log('SimpleAuth: Role set after auth change:', role, 'isAdmin:', role === 'admin');
            }
          });
        } else {
          console.log('SimpleAuth: No user, clearing role');
          setUserRole(null);
          setRoleLoading(false);
        }

        // Handle invitation redirects for sign-in events only
        if (event === 'SIGNED_IN' && session) {
          // Check for invitation context in URL params
          const urlParams = new URLSearchParams(window.location.search);
          const invitationToken = urlParams.get('invitation');
          
          if (invitationToken) {
            console.log('SimpleAuth: Found invitation token, redirecting to review flow');
            // Direct redirect to review page with invitation token
            setTimeout(() => {
              window.location.href = `/review/${invitationToken}`;
            }, 500);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        console.log('SimpleAuth: Initial session:', session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);

        // Fetch user role for initial session
        if (session?.user?.id) {
          console.log('SimpleAuth: Initial session has user, fetching role...');
          fetchUserRole(session.user.id).then(role => {
            if (mounted) {
              setUserRole(role);
              console.log('SimpleAuth: Initial role set:', role, 'isAdmin:', role === 'admin');
            }
          });
        }
      }
    });

    // Timeout for initialization
    const timeoutId = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('SimpleAuth: Initialization timed out');
        setLoading(false);
        setInitialized(true);
        setRoleLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initialized]);

  const value = {
    user,
    session,
    userRole,
    roleLoading,
    isAdmin,
    loading,
    initialized,
    signingOut,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    refreshUserRole,
  };

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};
