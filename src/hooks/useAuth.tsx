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
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  userRole: null,
  loading: true,
  resetPassword: async () => ({ error: new Error('Not implemented') }),
  createAdminUser: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
  ensureUserRole: async () => {}
});

// Admin emails list
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

  // Helper function to ensure user role exists
  const ensureUserRole = async (userId: string, role?: 'admin' | 'user') => {
    console.log("Ensuring user role exists for:", userId);
    
    try {
      // Check if role exists already
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleCheckError) {
        console.error("Error checking user role:", roleCheckError);
        return;
      }
      
      // If role exists, no need to create one
      if (existingRole) {
        console.log("User role already exists:", existingRole);
        setUserRole({ role: existingRole.role });
        return;
      }
      
      // Get the user's email to check if they should be an admin
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user data:", userError);
        return;
      }
      
      // If role is explicitly provided, use that
      // Otherwise, determine role based on email
      const roleToAssign = role || 
        (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email) ? 'admin' : 'user');
      
      console.log(`Assigning role '${roleToAssign}' to user ${userId}`);
      
      // Create user role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: roleToAssign });
        
      if (insertError) {
        console.error("Error creating user role:", insertError);
        
        // If the error is a duplicate key error, that's fine
        if (!insertError.message.includes('duplicate key')) {
          throw insertError;
        }
      }
      
      setUserRole({ role: roleToAssign });
      console.log("Role assigned successfully");
    } catch (error) {
      console.error("Error in ensureUserRole:", error);
      // Default to user role on error
      setUserRole({ role: 'user' });
    }
  };

  // Handle sign-out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  // Fetch user role
  const fetchUserRole = async (userId: string) => {
    console.log("Fetching user role for:", userId);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        // Check if the error is related to missing tables
        if (error.message.includes('does not exist')) {
          console.error("user_roles table may not exist. User needs to set up database schema.");
          toast({
            title: "Database setup issue",
            description: "The user_roles table may not exist. Please check your database setup.",
            variant: "destructive"
          });
        }
        
        // Check if email is in admin list
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email)) {
          console.log("Setting admin role based on email");
          setUserRole({ role: 'admin' });
          
          // Try to ensure role exists
          await ensureUserRole(userId, 'admin');
        } else {
          setUserRole({ role: 'user' });
          
          // Try to ensure role exists
          await ensureUserRole(userId, 'user');
        }
      } else if (data) {
        console.log("User role fetched:", data);
        setUserRole({ role: data.role });
      } else {
        console.log("No role found, defaulting to user");
        setUserRole({ role: 'user' });
        
        // Ensure user role exists
        await ensureUserRole(userId);
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole({ role: 'user' }); // Default to user role on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth listeners");
    
    // IMPORTANT: Set up auth state listener FIRST before checking for session
    // This prevents auth listener deadlocks and race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in successfully",
            description: "Welcome back!"
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out."
          });
        } else if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Password recovery requested",
            description: "Check your email for password reset instructions."
          });
        } else if (event === 'USER_UPDATED') {
          toast({
            title: "Account updated",
            description: "Your account has been updated successfully."
          });
        }
        
        // Fetch user role if we have a session
        if (currentSession?.user) {
          // Use setTimeout to avoid potential auth listener deadlock
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
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
        await ensureUserRole(data.user.id, 'admin');
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
      createAdminUser,
      signOut,
      ensureUserRole
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
