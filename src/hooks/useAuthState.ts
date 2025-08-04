
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handlePostAuthRedirect } from '@/utils/authStorage';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshAuth = async () => {
    try {
      console.log('AuthProvider: Refreshing auth state...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('AuthProvider: Error refreshing session:', error);
        throw error;
      }
      console.log('AuthProvider: Refreshed session:', session?.user?.email || 'no user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    } catch (error) {
      console.error('AuthProvider: Failed to refresh auth:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    let mounted = true;
    
    // Set up auth state listener - AVOID ASYNC FUNCTIONS AND SUPABASE CALLS IN CALLBACK
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no user');
        
        // Only synchronous state updates in the callback
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the auth state
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
          setInitialized(true);
        }

        // Handle post-authentication redirect immediately for sign-in events
        if (event === 'SIGNED_IN' && session && mounted) {
          handlePostAuthRedirect(mounted);
        }
      }
    );

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          throw error;
        }
        
        console.log('AuthProvider: Initial session:', session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error('AuthProvider: Error during auth initialization:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Add timeout for auth initialization
    const timeoutId = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('AuthProvider: Auth initialization timed out');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000);

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [initialized]);

  return {
    user,
    session,
    loading,
    initialized,
    refreshAuth
  };
};
