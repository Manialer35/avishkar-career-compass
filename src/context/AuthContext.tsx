// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { auth } from '@/firebase';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: any | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  getSupabaseToken: () => Promise<string | null>;
  signInWithPhone: (phone: string) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  confirmationResult: ConfirmationResult | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setIsAdmin(false);
      setConfirmationResult(null);
      toast({
        title: "Signed out successfully",
      });
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

  // Phone auth functions
  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      console.log('Sending OTP to phone:', phone);
      
      if (!window.recaptchaVerifier) {
        throw new Error('RecaptchaVerifier not initialized. Please ensure the auth form is loaded.');
      }
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      
      setConfirmationResult(result);
      console.log('OTP sent successfully');
      return result;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    try {
      console.log('Verifying OTP');
      const result = await confirmationResult.confirm(otp);
      
      console.log('OTP verification successful', result.user);
      setConfirmationResult(null);
      
      // Firebase user will be handled by onAuthStateChanged
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        // Check Supabase session first
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error("Supabase session error:", error);
        } else if (data?.session?.user) {
          setUser(data.session.user);
          
          // Check admin status for Supabase users
          const adminStatus = await checkIsAdmin(data.session.user);
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
    }, 5000);

    initAuth();

    // Set up Firebase auth state listener
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      
      console.log('Firebase auth state changed:', firebaseUser?.phoneNumber);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // For Firebase users, create/link Supabase session
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (!error && data.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Error creating Supabase session:', error);
        }
        
        toast({
          title: "Signed in successfully",
          description: `Welcome ${firebaseUser.phoneNumber}!`,
        });
      }
      
      setLoading(false);
    });

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const supabaseUser = session?.user ?? null;
      
      // Only update if this is a direct Supabase login (not Firebase-triggered)
      if (supabaseUser && !firebaseUser) {
        setUser(supabaseUser);
        
        const adminStatus = await checkIsAdmin(supabaseUser);
        setIsAdmin(adminStatus);
        
        toast({
          title: "Signed in successfully", 
          description: `Welcome ${supabaseUser.email}!`,
        });
      } else if (!supabaseUser && !firebaseUser) {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribeFirebase();
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [toast, firebaseUser, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      isAdmin, 
      loading, 
      signOut, 
      getSupabaseToken,
      signInWithPhone,
      verifyOtp,
      confirmationResult
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
