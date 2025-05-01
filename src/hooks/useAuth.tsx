
import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  userRole: null,
  loading: true,
  resetPassword: async () => ({ error: new Error('Not implemented') }),
  createAdminUser: async () => ({ error: new Error('Not implemented') })
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Setting up auth listeners");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user role if we have a session
        if (currentSession?.user) {
          // Use setTimeout to avoid potential auth listener deadlock
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id)
                .single();
              
              if (error) {
                console.error("Error fetching user role:", error);
                setUserRole(null);
              } else {
                console.log("User role fetched:", data);
                setUserRole({ role: data.role });
              }
            } catch (error) {
              console.error("Error in fetchUserRole:", error);
              setUserRole(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role if we have a session
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth listeners");
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log("Fetching user role for:", userId);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } else {
        console.log("User role fetched:", data);
        setUserRole({ role: data.role });
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Get the current deployed URL instead of using localhost
      const currentUrl = window.location.origin;
      console.log("Resetting password with redirect to:", currentUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentUrl}/auth`,
      });
      
      return { error };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return { error: error as Error };
    }
  };

  // New function to create an admin user directly
  const createAdminUser = async (email: string, password: string) => {
    try {
      // First create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) {
        return { error };
      }
      
      if (data?.user) {
        // Insert admin role for this user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'admin'
          });
          
        if (roleError) {
          return { error: roleError };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error creating admin user:", error);
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
      createAdminUser 
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
