import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Enhanced error logging utility
const logError = (context: string, error: any, additionalData?: any) => {
  console.error(`[${context}] Error:`, error);
  if (additionalData) {
    console.error(`[${context}] Additional data:`, additionalData);
  }
};

// Enhanced authentication validation with token refresh and robust validation
const validateAuthentication = async () => {
  console.log('[Auth] Validating authentication...');
  
  try {
    // Step 1: Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logError('Auth', sessionError);
      throw new Error(`Session retrieval failed: ${sessionError.message}`);
    }
    
    // Step 2: Check if session exists and is valid
    if (!session) {
      console.error('[Auth] No session found');
      throw new Error('No active session - please log in');
    }
    
    if (!session.user) {
      console.error('[Auth] Session exists but no user');
      throw new Error('Invalid session - please log in again');
    }
    
    if (!session.access_token) {
      console.error('[Auth] Session exists but no access token');
      throw new Error('Invalid access token - please log in again');
    }
    
    // Step 3: Check token expiration (with 5 minute buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiresAt = session.expires_at;
    const fiveMinutesFromNow = currentTime + (5 * 60);
    
    console.log('[Auth] Token validation:', {
      currentTime,
      expiresAt: tokenExpiresAt,
      fiveMinutesFromNow,
      isExpiringSoon: tokenExpiresAt ? tokenExpiresAt < fiveMinutesFromNow : false
    });
    
    // Step 4: Refresh token if it's expiring soon or expired
    if (!tokenExpiresAt || tokenExpiresAt < fiveMinutesFromNow) {
      console.log('[Auth] Token expired or expiring soon, attempting refresh...');
      
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[Auth] Token refresh failed:', refreshError);
          throw new Error(`Token refresh failed: ${refreshError.message} - please log in again`);
        }
        
        if (!refreshData.session) {
          throw new Error('Token refresh succeeded but no session returned - please log in again');
        }
        
        console.log('[Auth] Token refreshed successfully');
        return refreshData.session;
      } catch (refreshError) {
        logError('Auth-Refresh', refreshError);
        throw new Error(`Authentication refresh failed: ${refreshError.message} - please log in again`);
      }
    }
    
    // Step 5: Validate token format
    const tokenParts = session.access_token.split('.');
    if (tokenParts.length !== 3) {
      console.error('[Auth] Invalid JWT token format');
      throw new Error('Invalid token format - please log in again');
    }
    
    // Step 6: Try to decode and validate token payload
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      if (!payload.sub || payload.sub !== session.user.id) {
        console.error('[Auth] Token user ID mismatch');
        throw new Error('Token validation failed - please log in again');
      }
      
      if (!payload.exp || payload.exp < currentTime) {
        console.error('[Auth] Token is expired according to payload');
        throw new Error('Token has expired - please log in again');
      }
      
      console.log('[Auth] Token validation successful for user:', session.user.id, {
        tokenExp: payload.exp,
        sessionExp: tokenExpiresAt,
        role: payload.role || 'no role'
      });
      
    } catch (decodeError) {
      console.error('[Auth] Failed to decode token payload:', decodeError);
      throw new Error('Token validation failed - please log in again');
    }
    
    console.log('[Auth] Authentication validated successfully for user:', session.user.id);
    return session;
    
  } catch (error) {
    logError('Auth-Validation', error);
    
    // Provide specific error messages for different auth failure types
    if (error.message.includes('JWT')) {
      throw new Error('Authentication token error - please log out and log in again');
    } else if (error.message.includes('refresh')) {
      throw new Error('Session expired - please log in again');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error during authentication - please check your connection');
    } else {
      throw error; // Re-throw with original message if it's already descriptive
    }
  }
};

// Health check utility
const performHealthCheck = async () => {
  console.log('[HealthCheck] Performing system health check...');
  try {
    const response = await supabase.functions.invoke('health-check');
    
    if (response.error) {
      logError('HealthCheck', response.error);
      throw new Error(`Health check failed: ${response.error.message}`);
    }
    
    console.log('[HealthCheck] Health check passed:', response.data);
    return response.data;
  } catch (error) {
    logError('HealthCheck', error);
    throw new Error(`Health check failed: ${error.message}`);
  }
};

interface TestParams {
  promptId: string;
  input: string;
  model: string;
  temp: number;
  tokens: number;
}

interface MultiTestParams {
  promptId: string;
  input: string;
  models: string[];
  temp: number;
  tokens: number;
}

export const useTestMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const testPromptMutation = useMutation({
    mutationFn: async ({ promptId, input, model, temp, tokens }: TestParams) => {
      console.log('[SingleTest] Starting test with params:', { promptId, model, temp, tokens, inputLength: input.length });
      
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          console.log('[SingleTest] Cancelling previous request');
          abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        // Step 1: Validate authentication
        const session = await validateAuthentication();
        
        // Step 2: Perform health check
        await performHealthCheck();
        
        console.log('[SingleTest] Pre-flight checks passed, invoking edge function...');

        // Set timeout for request
        const timeoutPromise = new Promise((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            console.log('[SingleTest] Request timeout reached');
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            reject(new Error('Request timeout (2 minutes) - please try again'));
          }, 120000); // 2 minutes timeout
        });

        const requestPromise = supabase.functions.invoke('run-prompt-test', {
          body: {
            promptId,
            testInput: input,
            modelName: model,
            temperature: temp,
            maxTokens: tokens
          }
        });

        console.log('[SingleTest] Edge function invocation started');
        const response = await Promise.race([requestPromise, timeoutPromise]) as any;
        
        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        console.log('[SingleTest] Edge function response received:', response);

        if (response.error) {
          logError('SingleTest', response.error, { promptId, model });
          throw new Error(`Test failed: ${response.error.message || 'Unknown error'}`);
        }
        
        console.log('[SingleTest] Test completed successfully');
        return response.data;
      } catch (error) {
        logError('SingleTest', error, { promptId, model, temp, tokens });
        throw error;
      }
    },
    onSuccess: async (_, variables) => {
      // Force refetch with proper cache invalidation
      await queryClient.invalidateQueries({ queryKey: ['test_results', variables.promptId] });
      await queryClient.refetchQueries({ queryKey: ['test_results', variables.promptId] });
      
      toast({
        title: "Test completed",
        description: "Your prompt has been tested successfully. Results are being refreshed...",
      });
    },
    onError: (error: any) => {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      logError('SingleTestMutation', error);
      
      let errorMessage = "An error occurred while testing the prompt.";
      let errorTitle = "Test failed";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request was cancelled";
        errorTitle = "Request cancelled";
      } else if (error.message) {
        // Enhanced error handling for authentication-specific errors
        if (error.message.includes('token') || error.message.includes('authentication') || error.message.includes('log in')) {
          errorTitle = "Authentication Error";
          errorMessage = error.message + " - Try refreshing the page or logging out and back in.";
        } else if (error.message.includes('refresh') || error.message.includes('expired')) {
          errorTitle = "Session Expired";
          errorMessage = error.message + " - Please log out and log in again.";
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorTitle = "Network Error";
          errorMessage = error.message + " - Please check your internet connection.";
        } else if (error.message.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const multiTestMutation = useMutation({
    mutationFn: async ({ promptId, input, models, temp, tokens }: MultiTestParams) => {
      console.log('[MultiTest] Starting multi-model test with params:', { promptId, models, temp, tokens, inputLength: input.length });
      
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          console.log('[MultiTest] Cancelling previous request');
          abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        // Step 1: Validate authentication
        const session = await validateAuthentication();
        
        // Step 2: Perform health check
        await performHealthCheck();
        
        console.log('[MultiTest] Pre-flight checks passed, invoking edge function...');

        // Set timeout for request (longer for multi-model tests)
        const timeoutPromise = new Promise((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            console.log('[MultiTest] Request timeout reached');
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            reject(new Error('Request timeout (5 minutes) - please try again'));
          }, 300000); // 5 minutes timeout for multi-model
        });

        const requestPromise = supabase.functions.invoke('run-multi-model-test', {
          body: {
            promptId,
            testInput: input,
            modelNames: models,
            temperature: temp,
            maxTokens: tokens
          }
        });

        console.log('[MultiTest] Edge function invocation started');
        const response = await Promise.race([requestPromise, timeoutPromise]) as any;
        
        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        console.log('[MultiTest] Edge function response received:', response);

        if (response.error) {
          logError('MultiTest', response.error, { promptId, models });
          throw new Error(`Multi-model test failed: ${response.error.message || 'Unknown error'}`);
        }
        
        console.log('[MultiTest] Multi-model test completed successfully');
        return response.data;
      } catch (error) {
        logError('MultiTest', error, { promptId, models, temp, tokens });
        throw error;
      }
    },
    onSuccess: async (_, variables) => {
      // Force refetch with proper cache invalidation
      await queryClient.invalidateQueries({ queryKey: ['test_results', variables.promptId] });
      await queryClient.refetchQueries({ queryKey: ['test_results', variables.promptId] });
      
      toast({
        title: "Multi-model test completed",
        description: `Successfully tested with ${variables.models.length} models. Results are being refreshed...`,
      });
    },
    onError: (error: any) => {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      logError('MultiTestMutation', error);
      
      let errorMessage = "An error occurred while testing the prompt.";
      let errorTitle = "Multi-model test failed";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request was cancelled";
        errorTitle = "Request cancelled";
      } else if (error.message) {
        // Enhanced error handling for authentication-specific errors
        if (error.message.includes('token') || error.message.includes('authentication') || error.message.includes('log in')) {
          errorTitle = "Authentication Error";
          errorMessage = error.message + " - Try refreshing the page or logging out and back in.";
        } else if (error.message.includes('refresh') || error.message.includes('expired')) {
          errorTitle = "Session Expired";
          errorMessage = error.message + " - Please log out and log in again.";
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorTitle = "Network Error";
          errorMessage = error.message + " - Please check your internet connection.";
        } else if (error.message.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  return {
    runSingleTest: testPromptMutation.mutate,
    runMultiTest: multiTestMutation.mutate,
    isLoadingSingle: testPromptMutation.isPending,
    isLoadingMulti: multiTestMutation.isPending,
    isLoading: testPromptMutation.isPending || multiTestMutation.isPending
  };
};