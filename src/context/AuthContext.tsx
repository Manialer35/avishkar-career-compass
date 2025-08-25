// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_NUMBERS } from "@/config/admins";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  getSupabaseToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function checkIsAdmin(user: any): Promise<boolean> {
  if (!user) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !error && !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSupabaseToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting Supabase token:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error("Session error:", error);
          setLoading(false);
          return;
        }

        const u = data?.session?.user ?? null;
        setUser(u);
        
        // Only check admin if user exists
        if (u) {
          const adminStatus = await checkIsAdmin(u);
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Add timeout to prevent hanging
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth initialization timeout");
        setLoading(false);
      }
    }, 10000);

    initAuth();

    // Optimized auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const u = session?.user ?? null;
      setUser(u);
      
      if (u && event === 'SIGNED_IN') {
        const adminStatus = await checkIsAdmin(u);
        setIsAdmin(adminStatus);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut, getSupabaseToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
