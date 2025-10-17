// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from '@/firebase';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential
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

      const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Detect native Capacitor environment without importing at module scope
      const isNative = typeof window !== 'undefined' && (
        !!(window as any).Capacitor?.isNativePlatform?.() ||
        window.location.protocol === 'capacitor:'
      );

      // Native (Capacitor) path: use @capacitor-firebase/authentication (no web reCAPTCHA)
      if (isNative) {
        try {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

          // Best-effort: remove any previous listeners to avoid duplicates
          try { await (FirebaseAuthentication as any).removeAllListeners?.(); } catch {}

          const confirmation = await new Promise<ConfirmationResult>(async (resolve, reject) => {
            let resolved = false;

            const codeSent = await (FirebaseAuthentication as any).addListener('phoneCodeSent', async (event: any) => {
              try {
                const dummy: any = {
                  verificationId: event?.verificationId,
                  confirm: async (code: string) => {
                    return (FirebaseAuthentication as any).confirmVerificationCode({
                      verificationId: event?.verificationId,
                      verificationCode: code,
                    }) as any;
                  },
                };
                setConfirmationResult(dummy as ConfirmationResult);
                resolved = true;
                resolve(dummy as ConfirmationResult);
              } catch (e) {
                reject(e);
              }
            });

            const autoVerified = await (FirebaseAuthentication as any).addListener('phoneVerificationCompleted', async () => {
              // Auto-verification on Android signs user in automatically
              setConfirmationResult(null);
            });

            const failed = await (FirebaseAuthentication as any).addListener('phoneVerificationFailed', (e: any) => {
              if (!resolved) reject(new Error(e?.message || 'Phone verification failed'));
            });

            try {
              await (FirebaseAuthentication as any).signInWithPhoneNumber({ phoneNumber: cleanPhone });
            } catch (err) {
              reject(err);
            }
          });

          return confirmation;
        } catch (nativeErr) {
          console.warn('Native phone auth unavailable, falling back to web reCAPTCHA:', nativeErr);
          // Fall through to web path
        }
      }

      // Web path: use Firebase Web reCAPTCHA + signInWithPhoneNumber
      // Clear any existing reCAPTCHA first
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing existing reCAPTCHA:', e);
        }
        (window as any).recaptchaVerifier = undefined;
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

      try {
        let recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          // Create an offscreen container if it doesn't exist (works across routes/modals)
          recaptchaContainer = document.createElement('div');
          recaptchaContainer.id = 'recaptcha-container';
          recaptchaContainer.style.position = 'fixed';
          recaptchaContainer.style.left = '-9999px';
          recaptchaContainer.style.top = '0';
          document.body.appendChild(recaptchaContainer);
        }

        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved successfully');
          },
          'expired-callback': () => {
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = undefined;
            }
          },
          'error-callback': (error: any) => {
            console.error('reCAPTCHA error:', error);
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = undefined;
            }
          }
        });

        await (window as any).recaptchaVerifier.render();
        console.log('reCAPTCHA rendered successfully for domain:', window.location.hostname);
      } catch (recaptchaError) {
        console.error('reCAPTCHA initialization error:', recaptchaError);
        console.error('Current domain:', window.location.hostname);
        throw new Error('reCAPTCHA initialization failed. Please make sure you\'re accessing from an authorized domain.');
      }

      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);

      setConfirmationResult(result);
      console.log('OTP sent successfully');
      return result;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Clear recaptcha on any error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.log('Error clearing reCAPTCHA on error:', e);
        }
        (window as any).recaptchaVerifier = undefined;
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
        isMobile: typeof window !== 'undefined' && (
          /Android/i.test(navigator.userAgent) || 
          /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          window.location.protocol === 'capacitor:'
        ),
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

    // Immediately check current auth state
    const initAuth = () => {
      const currentUser = auth.currentUser;
      console.log('Initial auth state:', currentUser ? currentUser.phoneNumber || currentUser.email : 'no user');
      
      if (currentUser) {
        setUser(currentUser);
        // Check admin status asynchronously
        checkIsAdmin(currentUser)
          .then((admin) => setIsAdmin(admin))
          .catch(() => setIsAdmin(false));
        
        // Fire-and-forget profile creation
        setTimeout(() => { void ensureUserProfileExists(currentUser); }, 0);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    // Set up Firebase auth state listener
    const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted) return;
      
      console.log('Firebase auth state changed:', firebaseUser ? firebaseUser.phoneNumber || firebaseUser.email : 'signed out');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Do not block UI here — update admin flag asynchronously
        checkIsAdmin(firebaseUser)
          .then((admin) => setIsAdmin(admin))
          .catch(() => setIsAdmin(false));
        
        // Fire-and-forget profile creation to avoid deadlocks on slow networks
        setTimeout(() => { void ensureUserProfileExists(firebaseUser); }, 0);
        
        toast({
          title: "Signed in successfully",
          description: `Welcome ${firebaseUser.phoneNumber || firebaseUser.email}!`,
        });
      } else {
        setIsAdmin(false);
      }
      
      // Always set loading to false after auth state change
      setLoading(false);
    });

    // Initialize auth state immediately
    initAuth();

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
