import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ProfileData {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: string;
  phone_number: string | null;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Ensure user profile exists before querying
      await ensureUserProfileExists();

      // Fetch profile data using .maybeSingle() to avoid errors when no data exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      // Fetch user role data using .maybeSingle()
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, phone_number')
        .eq('user_id', user.uid)
        .maybeSingle();

      if (roleError) {
        console.error('Role fetch error:', roleError);
      }

      setProfile(profileData);
      setUserRole(roleData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureUserProfileExists = async () => {
    if (!user) return;

    try {
      // Try to create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          username: user.email ? user.email.split('@')[0] : `user_${user.uid.substring(0, 8)}`,
          full_name: user.displayName || null,
          avatar_url: user.photoURL || null
        }, {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Try to create user role if it doesn't exist  
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.uid,
          role: user.phoneNumber && ['+918888769281', '+918484843232'].includes(user.phoneNumber) ? 'admin' : 'user',
          phone_number: user.phoneNumber || null
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return false;

    try {
      setUpdating(true);

      // Ensure profile exists before updating
      await ensureUserProfileExists();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updatePhoneNumber = async (phoneNumber: string) => {
    if (!user) return false;

    try {
      setUpdating(true);

      // Ensure user role exists before updating
      await ensureUserProfileExists();

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.uid,
          phone_number: phoneNumber,
          role: (userRole?.role || 'user') as 'user' | 'admin'
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update local state
      setUserRole(prev => prev ? { ...prev, phone_number: phoneNumber } : { role: 'user', phone_number: phoneNumber });

      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated successfully."
      });

      return true;
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Error updating phone number",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    userRole,
    loading,
    updating,
    updateProfile,
    updatePhoneNumber,
    refreshProfile: fetchProfile
  };
};