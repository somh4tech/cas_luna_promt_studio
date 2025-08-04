
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserDetection = (email: string | undefined) => {
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUserExists = async () => {
      if (!email) {
        setUserExists(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('user_exists_by_email', {
          email_address: email
        });
        
        if (error) {
          console.error('Error checking user existence:', error);
          setUserExists(null);
        } else {
          setUserExists(data);
        }
      } catch (error) {
        console.error('Exception checking user existence:', error);
        setUserExists(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserExists();
  }, [email]);

  return { userExists, isLoading };
};
