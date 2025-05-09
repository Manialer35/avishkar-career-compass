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

  // Check email verification status
  const checkEmailVerificationStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      
      if (error || !userData?.user) {
        console.error("Error getting user data:", error);
        return false;
      }
      
      // In Supabase, email verified status is available on the user object
      return !!userData.user.email_confirmed_at;
    } catch (error) {
      console.error("Error checking email verification status:", error);
      return false;
    }
  };

  // Update the ensureUserRole function with better transaction handling
  const ensureUserRole = async (userId: string, role?: 'admin' | 'user') => {
    console.log("Ensuring user role exists for:", userId);
    
    if (!userId) {
      console.error("Cannot ensure role for empty userId");
      return;
    }
    
    try {
      // Get the user's email to check if they should be an admin
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user data:", userError);
        setUserRole({ role: role || 'user' });
        return;
      }
      
      // If role is explicitly provided, use that
      // Otherwise, determine role based on email
      const roleToAssign = role || 
        (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email) ? 'admin' : 'user');
      
      console.log(`Assigning role '${roleToAssign}' to user ${userId}`);
      
      // Use upsert with onConflict to handle duplicates properly
      const { data, error: upsertError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: roleToAssign 
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        })
        .select('role')
        .single();
        
      if (upsertError) {
        console.error("Error upserting user role:", upsertError);
        
        // As a fallback, try to get the role if it exists
        const { data: existingRole, error: fetchError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!fetchError && existingRole) {
          console.log("Retrieved existing role:", existingRole);
          setUserRole({ role: existingRole.role });
        } else {
          // Default to the determined role if we can't fetch it
          setUserRole({ role: roleToAssign });
        }
      } else if (data) {
        console.log("Role upserted successfully:", data);
        setUserRole({ role: data.role });
      } else {
        // This shouldn't happen, but just in case
        setUserRole({ role: roleToAssign });
      }
    } catch (error) {
      console.error("Error in ensureUserRole:", error);
      // Default to user role on error
      setUserRole({ role: role || 'user' });
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
      // First check directly from the database
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
        
        // Get current user for email check
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email)) {
            console.log("Setting admin role based on email");
            setUserRole({ role: 'admin' });
            
            // Try to ensure role exists
            await ensureUserRole(userId, 'admin');
          } else {
            console.log("Setting user role based on default");
            setUserRole({ role: 'user' });
            
            // Try to ensure role exists
            await ensureUserRole(userId, 'user');
          }
        } catch (userError) {
          console.error("Error getting user for role check:", userError);
          setUserRole({ role: 'user' });
        }
      } else if (data) {
        console.log("User role fetched:", data);
        setUserRole({ role: data.role });
      } else {
        console.log("No role found, checking email for admin status");
        
        // No role found, check if email is in admin list
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email)) {
            console.log("Setting admin role based on email");
            setUserRole({ role: 'admin' });
          } else {
            console.log("Setting default user role");
            setUserRole({ role: 'user' });
          }
          
          // Ensure user role exists in database
          await ensureUserRole(userId);
        } catch (userError) {
          console.error("Error getting user for role check:", userError);
          setUserRole({ role: 'user' });
        }
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
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle specific auth events with better user feedback
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in successfully",
            description: "Welcome back!"
          });
          
          // Wait a bit before fetching user role to ensure auth is fully processed
          if (currentSession?.user) {
            setTimeout(() => {
              fetchUserRole(currentSession.user.id);
            }, 300);
          } else {
            setUserRole(null);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully."
          });
          setUserRole(null);
          setLoading(false);
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
          
          // Re-fetch user role on update
          if (currentSession?.user) {
            setTimeout(() => {
              fetchUserRole(currentSession.user.id);
            }, 300);
          }
        } else if (event === 'USER_DELETED') {
          toast({
            title: "Account deleted",
            description: "Your account has been deleted."
          });
          setUserRole(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Auth token refreshed");
        } else {
          // For other events, set loading to false if not otherwise handled
          setLoading(false);
        }
      }
    );

    // Check for existing session
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
          description: "Check your inbox for instructions to reset your password. Be sure to check your spam folder if you don't see it.",
          duration: 6000
        });
      } else {
        console.error("Password reset error:", error);
        toast({
          title: "Password reset failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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
          data: {
            role: 'admin', // Store role in metadata
          },
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        toast({
          title: "Admin user creation failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      if (data?.user) {
        try {
          // Use upsert to avoid duplicate key errors
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: data.user.id,
              role: 'admin'
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: true
            });
            
          if (roleError) {
            console.error("Error setting admin role:", roleError);
            // Continue even if this fails
          }
        } catch (roleError) {
          console.error("Exception setting admin role:", roleError);
          // Continue even if this fails
        }
        
        toast({
          title: "Admin user created",
          description: "The new admin account has been created successfully."
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast({
        title: "Admin user creation failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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
