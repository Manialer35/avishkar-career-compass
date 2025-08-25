import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSecureAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Get phone number from Firebase user object
        const phoneNumber = user.phoneNumber;
        console.log('Checking admin status for phone:', phoneNumber);
        
        if (phoneNumber) {
          const { data, error } = await supabase.functions.invoke('verify-admin', {
            body: { phoneNumber }
          });

          console.log('Admin verification result:', { data, error });

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.isAdmin || false);
          }
        } else {
          console.log('No phone number found for user');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Exception checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};