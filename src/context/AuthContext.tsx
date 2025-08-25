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

// Memoized admin check function to prevent repeated database calls
let adminCheckCache = new Map();
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function checkIsAdmin(user: any): Promise<boolean> {
  if (!user) return false;
  
  const now = Date.now();
  const cacheKey = user.id;
  
  // Check cache first for performance
  if (adminCheckCache.has(cacheKey) && now < cacheExpiry) {
    return adminCheckCache.get(cacheKey);
  }
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    const isAdmin = !error && !!data;
    
    // Cache the result
    adminCheckCache.set(cacheKey, isAdmin);
    cacheExpiry = now + CACHE_DURATION;
    
    return isAdmin;
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

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout for faster loading
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth timeout')), 3000);
        });

        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const u = data?.session?.user ?? null;
        if (!mounted) return;
        
        setUser(u);
        
        // Only check admin status if user exists (performance optimization)
        if (u) {
          const adminStatus = await checkIsAdmin(u);
          if (mounted) setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Debounced auth state listener for better performance
    let debounceTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      
      debounceTimeout = setTimeout(async () => {
        const u = session?.user ?? null;
        setUser(u);
        
        if (u) {
          const adminStatus = await checkIsAdmin(u);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
          // Clear admin cache when user logs out
          adminCheckCache.clear();
        }
      }, 100); // 100ms debounce
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (debounceTimeout) clearTimeout(debounceTimeout);
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
