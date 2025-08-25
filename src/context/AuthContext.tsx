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

    (async () => {
      try {
        // initial session -> faster on client
        const { data } = await supabase.auth.getSession();
        const u = data?.session?.user ?? null;
        if (!mounted) return;
        setUser(u);
        const adminStatus = await checkIsAdmin(u);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      const adminStatus = await checkIsAdmin(u);
      setIsAdmin(adminStatus);
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
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
