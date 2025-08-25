
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: User | null;
  supabaseUser: any | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmationResult: ConfirmationResult | null;
  getSupabaseToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listeners for both Firebase and Supabase
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('Firebase user signed in:', firebaseUser.phoneNumber);
        
        // Create or sign in user to Supabase
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (!error && data.user) {
            setSupabaseUser(data.user);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          console.log('Supabase user signed in:', session.user.email);
          setSupabaseUser(session.user);
          
          // If we have a Supabase session but no Firebase user, we're using email auth
          if (!user) {
            toast({
              title: "Signed in successfully",
              description: `Welcome ${session.user.email}!`,
            });
          }
        } else {
          setSupabaseUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      unsubscribeFirebase();
      subscription.unsubscribe();
    };
  }, [toast, user]);

  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      console.log('Sending OTP to phone:', phone);
      
      if (!window.recaptchaVerifier) {
        throw new Error('RecaptchaVerifier not initialized. Please ensure the auth form is loaded.');
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      
      setConfirmationResult(confirmationResult);
      console.log('OTP sent successfully');
      return confirmationResult;
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
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      await supabase.auth.signOut();
      setConfirmationResult(null);
      setSupabaseUser(null);
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

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    signInWithPhone,
    verifyOtp,
    signOut,
    confirmationResult,
    getSupabaseToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
