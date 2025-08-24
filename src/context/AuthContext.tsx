// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ADMIN_NUMBERS } from "@/config/admins";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractPhone(user: any): string | null {
  if (!user) return null;
  return (
    user.phone ??
    user.user_metadata?.phone ??
    user.user_metadata?.mobile ??
    user.identities?.[0]?.identity_data?.phone ??
    null
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // initial session -> faster on client
        const { data } = await supabase.auth.getSession();
        const u = data?.session?.user ?? null;
        if (!mounted) return;
        setUser(u);
        const phone = extractPhone(u);
        setIsAdmin(phone ? ADMIN_NUMBERS.includes(phone) : false);
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      const phone = extractPhone(u);
      setIsAdmin(phone ? ADMIN_NUMBERS.includes(phone) : false);
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
