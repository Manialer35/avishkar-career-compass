import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
        // Use phone-based admin verification since Firebase IDs are not UUIDs
        if (user.phoneNumber) {
          const { data, error } = await supabase.rpc('check_user_is_admin_by_phone', {
            user_phone: user.phoneNumber
          });

          console.log('Admin verification result:', { data, error, phone: user.phoneNumber });

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data === true);
          }
        } else {
          // Fallback to direct phone check if no phone number in user object
          const adminPhones = ['+918888769281', '+918484843232'];
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