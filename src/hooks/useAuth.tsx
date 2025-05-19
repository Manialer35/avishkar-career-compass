
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  role: string;
}

export interface AuthContextType {
  user: any | null;
  session: any | null;
  isAdmin: boolean;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword?: (email: string) => Promise<any>;
  createAdminUser?: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Check if user is admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', initialSession.user.id)
            .eq('role', 'admin')
            .single();

          if (!roleError && roleData) {
            setIsAdmin(true);
            setUserRole({ role: 'admin' });
          } else {
            setUserRole({ role: 'user' });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }

      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Check if new user is admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', newSession.user.id)
            .eq('role', 'admin')
            .single();

          if (!roleError && roleData) {
            setIsAdmin(true);
            setUserRole({ role: 'admin' });
          } else {
            setIsAdmin(false);
            setUserRole({ role: 'user' });
          }
          
          toast({
            title: "Signed in successfully",
            description: `Welcome ${newSession.user.email}!`,
          });
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setUserRole(null);
          toast({
            title: "Signed out successfully",
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();
  }, [toast, navigate]);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const createAdminUser = async (email: string, password: string) => {
    try {
      // First create the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError || !authData.user) {
        throw authError || new Error('Failed to create user');
      }
      
      // Then assign admin role to the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });
      
      if (roleError) {
        throw roleError;
      }
      
      return authData;
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAdmin,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    createAdminUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
