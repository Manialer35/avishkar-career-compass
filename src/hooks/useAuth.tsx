import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  createAdminUser: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  ensureUserRole: (userId: string, role?: 'admin' | 'user') => Promise<void>;
  checkEmailVerificationStatus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  resetPassword: async () => ({ error: new Error('Not implemented') }),
  createAdminUser: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
  ensureUserRole: async () => {},
  checkEmailVerificationStatus: async () => false
});

const ADMIN_EMAILS = [
  'khot.md@gmail.com',
  'neerajmadkar35@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkEmailVerificationStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) return false;
      return !!userData.user.email_confirmed_at;
    } catch {
      return false;
    }
  };

  const ensureUserRole = async (userId: string, role?: 'admin' | 'user') => {
    if (!userId) {
      setUserRole({ role: 'user' });
      return;
    }
    try {
      // First try to get existing role
      const { data: existingRole } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
      if (existingRole) {
        setUserRole({ role: existingRole.role });
        return;
      }
      
      // Determine role to assign
      const { data: userData } = await supabase.auth.getUser();
      const roleToAssign = role || (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email) ? 'admin' : 'user');

      // Try using the RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('ensure_user_role', {
          p_user_id: userId,
          p_role: roleToAssign
        });
        
        if (!rpcError) {
          setUserRole({ role: roleToAssign });
          return;
        }
      } catch (rpcError) {
        console.error("RPC error:", rpcError);
        // Fall through to direct insert if RPC fails
      }

      // Fall back to direct table insert if RPC fails
      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: roleToAssign },
          { onConflict: 'user_id' }
        );
      
      if (!upsertError) {
        setUserRole({ role: roleToAssign });
      } else {
        console.error("Upsert error:", upsertError);
        // Still set the role in memory even if DB operation failed
        setUserRole({ role: roleToAssign });
      }
    } catch (error) {
      console.error("Error in ensureUserRole:", error);
      // Set default role in memory
      setUserRole({ role: role || 'user' });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const fetchUserRole = async (userId: string) => {
    if (!userId) {
      setUserRole({ role: 'user' });
      setLoading(false);
      return;
    }
    try {
      // Try to get role from database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setUserRole({ role: data.role });
        setLoading(false);
        return;
      }
      
      // Determine role based on email if no role found
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email)) {
        setUserRole({ role: 'admin' });
        await ensureUserRole(userId, 'admin');
      } else {
        setUserRole({ role: 'user' });
        await ensureUserRole(userId, 'user');
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole({ role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        // Slight delay to ensure auth is fully processed
        setTimeout(() => fetchUserRole(currentSession.user.id), 300);
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setLoading(false);
      } else if (event === 'USER_UPDATED' && currentSession?.user) {
        setTimeout(() => fetchUserRole(currentSession.user.id), 300);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetPassword = async (email: string) => {
    try {
      const currentUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentUrl}/auth`
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // FIXED: Removed the problematic signup function that used Firebase

  const createAdminUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'admin' },
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) {
        return { error };
      }
      
      if (data?.user) {
        // Ensure the user has admin role in the database
        await supabase
          .from('user_roles')
          .upsert(
            { user_id: data.user.id, role: 'admin' },
            { onConflict: 'user_id', ignoreDuplicates: true }
          );
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      resetPassword,
      createAdminUser,
      signOut,
      ensureUserRole,
      checkEmailVerificationStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
