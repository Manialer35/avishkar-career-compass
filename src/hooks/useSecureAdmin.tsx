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
        // Get user ID consistently - Firebase user ID is what's stored in Supabase
        const userId = (user as any)?.uid || (user as any)?.localId || user?.id || user?.email;
        console.log('Checking admin status for user:', userId, 'email:', user.email);

        // Query the user_roles table directly using the Firebase user ID
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          const isAdminUser = data?.role === 'admin';
          console.log('Admin check result:', isAdminUser, 'role:', data?.role);
          setIsAdmin(isAdminUser);
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