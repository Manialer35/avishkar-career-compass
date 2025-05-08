
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
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth listeners");
    
    // IMPORTANT: Set up auth state listener FIRST before checking for session
    // This prevents auth listener deadlocks and race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Update session and user state
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
                .maybeSingle(); // Use maybeSingle instead of single to prevent errors
              
              if (error) {
                console.error("Error fetching user role:", error);
                // Check if email is in admin list and set role to admin
                if (currentSession.user.email && ['khot.md@gmail.com', 'neerajmadkar35@gmail.com'].includes(currentSession.user.email)) {
                  console.log("Setting admin role based on email");
                  setUserRole({ role: 'admin' });
                  
                  // Attempt to insert the admin role if it doesn't exist
                  const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert({
                      user_id: currentSession.user.id,
                      role: 'admin'
                    });
                  
                  if (insertError) {
                    console.error("Error inserting admin role:", insertError);
                  }
                } else {
                  setUserRole({ role: 'user' }); // Default to user role
                }
              } else if (data) {
                console.log("User role fetched:", data);
                setUserRole({ role: data.role });
              } else {
                // No role found, default to user
                console.log("No role found, defaulting to user role");
                setUserRole({ role: 'user' });
                
                // Insert default user role
                const { error: insertError } = await supabase
                  .from('user_roles')
                  .insert({
                    user_id: currentSession.user.id,
                    role: 'user'
                  });
                
                if (insertError && !insertError.message.includes('duplicate key')) {
                  console.error("Error inserting user role:", insertError);
                }
              }
            } catch (error) {
              console.error("Error in fetchUserRole:", error);
              setUserRole({ role: 'user' }); // Default to user role on error
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
      
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        console.log("Session expires at:", expiresAt);
        console.log("Current time:", now);
        console.log("Session valid:", expiresAt > now ? "Yes" : "No");
      }
      
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
        .maybeSingle(); // Use maybeSingle instead of single
      
      if (error) {
        console.error("Error fetching user role:", error);
        // Check if email is in admin list
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && ['khot.md@gmail.com', 'neerajmadkar35@gmail.com'].includes(userData.user.email)) {
          console.log("Setting admin role based on email");
          setUserRole({ role: 'admin' });
        } else {
          setUserRole({ role: 'user' }); // Default to user role
        }
      } else if (data) {
        console.log("User role fetched:", data);
        setUserRole({ role: data.role });
      } else {
        console.log("No role found, defaulting to user");
        setUserRole({ role: 'user' });
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole({ role: 'user' }); // Default to user role on error
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
      
      if (!error) {
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for instructions to reset your password."
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return { error: error as Error };
    }
  };

  // Function to create an admin user directly
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
