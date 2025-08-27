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
    return false;
  }
}

async function ensureUserProfileExists(firebaseUser: FirebaseUser) {
  try {
    console.log('Ensuring user profile exists for:', firebaseUser.uid);
    
    // Use edge function to create profile and role with service role permissions
    const { data, error } = await supabase.functions.invoke('create-user-profile', {
      body: {
        firebaseUserId: firebaseUser.uid,
        username: firebaseUser.email ? firebaseUser.email.split('@')[0] : `user_${firebaseUser.uid.substring(0, 8)}`,
        fullName: firebaseUser.displayName || null,
        avatarUrl: firebaseUser.photoURL || null,
        phoneNumber: firebaseUser.phoneNumber || null
      }
    });

    if (error) {
      console.error('Error creating user profile via edge function:', error);
      throw new Error(`Profile creation failed: ${error.message}`);
    }

    if (data?.success) {
      console.log('Profile and role created successfully:', data.message);
      return data.isAdmin || false;
    } else {
      console.error('Profile creation failed:', data?.error);
      throw new Error(data?.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    // Don't throw the error to prevent blocking authentication
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
      // Silent error for production
    }
  };

  const getSupabaseToken = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Get Firebase token for authentication with edge functions
      const firebaseToken = await user.getIdToken();
      return firebaseToken;
    } catch (error) {
      return null;
    }
  };

  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      setLoading(true);
      
      // Detect mobile environment or Lovable preview
      const isMobile = typeof window !== 'undefined' && (
        /Android/i.test(navigator.userAgent) || 
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.location.protocol === 'capacitor:'
      );
      
      const isLovablePreview = typeof window !== 'undefined' && (
        window.location.hostname.includes('lovable.app') ||
        window.location.hostname.includes('lovableproject.com')
      );
      
      // Clean phone number format
      const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // For mobile environments, use Firebase's native mobile auth (no reCAPTCHA)
      // For Lovable preview, use fallback auth
      if (isMobile && !isLovablePreview) {
        console.log('Attempting native mobile authentication');
        try {
          // For production mobile apps, Firebase handles authentication natively
          // No reCAPTCHA is needed or used in mobile environments
          const result = await signInWithPhoneNumber(auth, cleanPhone, null as any);
          setConfirmationResult(result);
          console.log('OTP sent successfully (native mobile mode)');
          return result;
        } catch (mobileError: any) {
          console.error('Native mobile auth error:', mobileError);
          throw new Error(`Mobile authentication failed: ${mobileError.message}. Please ensure your app is properly configured in Firebase Console with correct SHA-1 fingerprints.`);
        }
      } else if (isLovablePreview) {
        console.log('Attempting authentication without reCAPTCHA (preview mode)');
        try {
          const result = await signInWithPhoneNumber(auth, cleanPhone, null as any);
          setConfirmationResult(result);
          console.log('OTP sent successfully (preview mode)');
          return result;
        } catch (previewError: any) {
          console.log('Preview auth failed, showing test auth');
          throw new Error('This is a preview environment. Phone authentication requires a production Firebase setup with proper domain configuration.');
        }
      }
      
      // Clear any existing reCAPTCHA first
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing existing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = undefined;
      }
      
      // Wait for DOM to be ready
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          const handler = () => {
            document.removeEventListener('DOMContentLoaded', handler);
            resolve(true);
          };
          document.addEventListener('DOMContentLoaded', handler);
        }
      });
      
      // Initialize reCAPTCHA for web environments
      try {
        // Ensure the DOM element exists before creating RecaptchaVerifier
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          throw new Error('reCAPTCHA container not found in DOM');
        }

        // Enhanced reCAPTCHA configuration
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved successfully');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired, clearing verifier');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = undefined;
            }
          },
          'error-callback': (error: any) => {
            console.error('reCAPTCHA error:', error);
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = undefined;
            }
          }
        });

        // Render the reCAPTCHA
        await window.recaptchaVerifier.render();
        console.log('reCAPTCHA rendered successfully for domain:', window.location.hostname);
      } catch (recaptchaError) {
        console.error('reCAPTCHA initialization error:', recaptchaError);
        console.error('Current domain:', window.location.hostname);
        
        // If we're in a mobile environment and reCAPTCHA fails, provide helpful message
        if (isMobile) {
          throw new Error('This appears to be a mobile app environment. Please ensure the app is properly configured for Android in Firebase Console.');
        }
        
        throw new Error('reCAPTCHA initialization failed. Please make sure you\'re accessing from an authorized domain.');
      }
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
      
      setConfirmationResult(result);
      console.log('OTP sent successfully');
      return result;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Clear recaptcha on any error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA on error:', e);
        }
        window.recaptchaVerifier = undefined;
      }
      
      // Provide better error messages based on environment
      const isMobile = typeof window !== 'undefined' && (
        /Android/i.test(navigator.userAgent) || 
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.location.protocol === 'capacitor:'
      );
      
      const isLovablePreview = typeof window !== 'undefined' && (
        window.location.hostname.includes('lovable.app') ||
        window.location.hostname.includes('lovableproject.com')
      );
      
      if (error.code === 'auth/captcha-check-failed') {
        let message;
        if (isLovablePreview) {
          message = 'This is a Lovable preview environment. Phone authentication requires a production Firebase setup. For testing, please deploy to a production environment.';
        } else if (isMobile) {
          message = 'This app is designed for mobile use. Please ensure proper Firebase configuration for Android apps.';
        } else {
          message = 'reCAPTCHA verification failed. Please make sure you\'re accessing from an authorized domain. Current domain: ' + window.location.hostname;
        }
        throw new Error(message);
      } else if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please include country code.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/recaptcha-not-enabled') {
        throw new Error('reCAPTCHA is not enabled for this Firebase project.');
      } else if (error.code === 'auth/missing-app-credential') {
        const message = isMobile ? 
          'Mobile app credentials are missing. Please ensure the Android app is properly configured in Firebase Console.' :
          'App credentials are missing. Please check Firebase configuration.';
        throw new Error(message);
      }
      
      // Log detailed error information for debugging
      console.error('Firebase Auth Error Details:', {
        code: error.code,
        message: error.message,
        domain: window.location.hostname,
        origin: window.location.origin,
        isMobile: isMobile,
        userAgent: navigator.userAgent
      });
      
      throw error;
    } finally {
      setLoading(false);
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
      
      console.log('Firebase auth state changed:', firebaseUser?.phoneNumber || firebaseUser?.email);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Ensure user profile exists in Supabase
        await ensureUserProfileExists(firebaseUser);
        
        // Check admin status
        const adminStatus = await checkIsAdmin(firebaseUser);
        setIsAdmin(adminStatus);
        
        toast({
          title: "Signed in successfully",
          description: `Welcome ${firebaseUser.phoneNumber || firebaseUser.email}!`,
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
