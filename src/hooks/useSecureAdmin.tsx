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
        // Check admin status by phone number using edge function
        const phoneNumber = user.phoneNumber;
        if (phoneNumber) {
          const { data, error } = await supabase.functions.invoke('verify-admin', {
            body: { phoneNumber }
          });

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.isAdmin || false);
          }
        } else {
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