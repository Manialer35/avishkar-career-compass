// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from '@/firebase';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  RecaptchaVerifier
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  confirmationResult: ConfirmationResult | null;
  getSupabaseToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function checkIsAdmin(user: FirebaseUser): Promise<boolean> {
  if (!user || !user.phoneNumber) return false;
  
  try {
    // Check if phone number is admin - using phone number directly for admin check
    const adminPhones = ['+918888769281', '+91 8888769281', '8888769281'];
    const cleanPhone = user.phoneNumber.replace(/\s/g, '');
    
    return adminPhones.some(phone => {
      const cleanAdminPhone = phone.replace(/\s/g, '');
      return cleanPhone === cleanAdminPhone || cleanPhone.endsWith(cleanAdminPhone.replace('+91', ''));
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
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
    // For this simplified version, we'll return a mock token
    // In production, you'd want to implement proper token exchange
    return user ? 'mock-token' : null;
  };

  // Phone auth functions
  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      console.log('Sending OTP to phone:', phone);
      
      // Initialize recaptcha if not already done
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            window.recaptchaVerifier = undefined;
          }
        });
      }
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      
      setConfirmationResult(result);
      console.log('OTP sent successfully');
      return result;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Clear recaptcha on error and try to reinitialize
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      
      throw error;
    }
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    try {
      console.log('Verifying OTP');
      const result = await confirmationResult.confirm(otp);
      
      console.log('OTP verification successful', result.user.phoneNumber);
      setConfirmationResult(null);
      
      // Firebase user will be handled by onAuthStateChanged
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up Firebase auth state listener
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      
      console.log('Firebase auth state changed:', firebaseUser?.phoneNumber);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Check admin status
        const adminStatus = await checkIsAdmin(firebaseUser);
        setIsAdmin(adminStatus);
        
        toast({
          title: "Signed in successfully",
          description: `Welcome ${firebaseUser.phoneNumber}!`,
        });
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribeFirebase();
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      signOut, 
      signInWithPhone,
      verifyOtp,
      confirmationResult,
      getSupabaseToken
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
