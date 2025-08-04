import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';

interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

export const useLoadingTimeout = (isLoading: boolean, options: UseLoadingTimeoutOptions = {}) => {
  const { timeoutMs = 10000, onTimeout } = options;
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const handleTimeout = useCallback(async () => {
    console.log('Dashboard loading timeout reached, logging out user');
    setTimeoutReached(true);
    
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during timeout logout:', error);
      // Force navigation even if signOut fails
      navigate('/auth');
    }
    
    onTimeout?.();
  }, [signOut, navigate, onTimeout]);

  const forceLogout = useCallback(async () => {
    console.log('User requested manual logout during loading');
    await handleTimeout();
  }, [handleTimeout]);

  useEffect(() => {
    if (!isLoading) {
      setTimeoutReached(false);
      setSecondsElapsed(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    // Update seconds counter
    intervalId = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    // Set timeout
    timeoutId = setTimeout(() => {
      handleTimeout();
    }, timeoutMs);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isLoading, timeoutMs, handleTimeout]);

  const getLoadingMessage = () => {
    if (secondsElapsed < 5) {
      return "Loading projects...";
    } else if (secondsElapsed < 8) {
      return "This is taking longer than expected...";
    } else {
      return "Please wait, finishing up...";
    }
  };

  return {
    timeoutReached,
    secondsElapsed,
    forceLogout,
    getLoadingMessage,
    showManualLogout: secondsElapsed >= 5
  };
};
