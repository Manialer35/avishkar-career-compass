import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSecureAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('[useSecureAdmin] Starting admin check...');
      
      if (!user) {
        console.log('[useSecureAdmin] No user logged in');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Get user ID consistently - Firebase user ID is what's stored in Supabase
        const userId = (user as any)?.uid || (user as any)?.localId || user?.id || user?.email;
        console.log('[useSecureAdmin] Checking admin for user:', userId);
        console.log('[useSecureAdmin] User email:', user.email);

        // Query the user_roles table directly using the Firebase user ID
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('[useSecureAdmin] Query result:', { data, error });

        if (error) {
          console.error('[useSecureAdmin] Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          const isAdminUser = data?.role === 'admin';
          console.log('[useSecureAdmin] Is admin?', isAdminUser, 'Role:', data?.role);
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error('[useSecureAdmin] Exception checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};