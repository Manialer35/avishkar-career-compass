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
        // Admin emails for Google Sign-in users
        const adminEmails = ['neerajmadkar35@gmail.com', 'atulmadkar33@gmail.com'];
        const adminPhones = ['+918888769281', '+918484843232'];

        // Check by email (for Google Sign-in)
        if (user.email && adminEmails.includes(user.email)) {
          console.log('Admin verified by email:', user.email);
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Check by phone (for phone auth)
        if (user.phoneNumber) {
          if (adminPhones.includes(user.phoneNumber)) {
            console.log('Admin verified by phone:', user.phoneNumber);
            setIsAdmin(true);
            setLoading(false);
            return;
          }

          const { data, error } = await supabase.rpc('check_user_is_admin_by_phone', {
            user_phone: user.phoneNumber
          });

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data === true);
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