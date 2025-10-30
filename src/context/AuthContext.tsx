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
      // Local UI handles loading state; do not toggle global loading here

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

          // 8-second watchdog: if native auth doesn't respond, force fallback to web
          const nativeAuthPromise = new Promise<ConfirmationResult>(async (resolve, reject) => {
            let settled = false;
            let codeSentHandle: any;
            let completedHandle: any;
            let failedHandle: any;
            let timeoutId: any;

            const cleanup = async () => {
              try { await codeSentHandle?.remove?.(); } catch {}
              try { await completedHandle?.remove?.(); } catch {}
              try { await failedHandle?.remove?.(); } catch {}
              if (timeoutId) clearTimeout(timeoutId);
            };

            // Resolve when code is sent (manual OTP entry flow)
            codeSentHandle = await (FirebaseAuthentication as any).addListener('phoneCodeSent', async (event: any) => {
              if (settled) return;
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
                settled = true;
                await cleanup();
                resolve(dummy as ConfirmationResult);
              } catch (e) {
                settled = true;
                await cleanup();
                reject(e);
              }
            });

            // Resolve when auto verification completes (Android auto OTP)
            completedHandle = await (FirebaseAuthentication as any).addListener('phoneVerificationCompleted', async () => {
              if (settled) return;
              try {
                // User is already signed in automatically
                setConfirmationResult(null);
                const autoVerifiedDummy: any = {
                  verificationId: null,
                  confirm: async () => ({ user: null }),
                };
                settled = true;
                await cleanup();
                resolve(autoVerifiedDummy as ConfirmationResult);
              } catch (e) {
                settled = true;
                await cleanup();
                reject(e);
              }
            });

            // Fail on verification failure
            failedHandle = await (FirebaseAuthentication as any).addListener('phoneVerificationFailed', async (e: any) => {
              if (settled) return;
              settled = true;
              await cleanup();
              reject(new Error(e?.message || 'Phone verification failed'));
            });

            // Safety timeout to prevent infinite loading
            const timeoutMs = 30000; // 30s
            timeoutId = setTimeout(async () => {
              if (settled) return;
              settled = true;
              await cleanup();
              reject(new Error('OTP request timed out. Please try again.'));
            }, timeoutMs);

            try {
              await (FirebaseAuthentication as any).signInWithPhoneNumber({ phoneNumber: cleanPhone });
            } catch (err) {
              if (!settled) {
                settled = true;
                await cleanup();
                reject(err);
              }
            }
          });

          // Watchdog: if native doesn't respond in 8s, fallback to web
          const watchdogTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('NATIVE_AUTH_TIMEOUT'));
            }, 8000);
          });

          const confirmation = await Promise.race([nativeAuthPromise, watchdogTimeout]);
          console.log('✅ Native auth successful');
          return confirmation;
        } catch (nativeErr: any) {
          if (nativeErr?.message === 'NATIVE_AUTH_TIMEOUT') {
            console.warn('⚠️ Native auth timed out after 8s, forcing fallback to web reCAPTCHA');
            toast({
              title: "Using web verification",
              description: "Native verification is taking too long, switching to web method",
              variant: "default"
            });
          } else {
            console.warn('Native phone auth unavailable, falling back to web reCAPTCHA:', nativeErr);
          }
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

      // Race the OTP request with a timeout to avoid hanging UI
      const sendPromise = signInWithPhoneNumber(auth, cleanPhone, appVerifier);
      const timeoutMs = 15000; // 15s safety timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          try {
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = undefined;
            }
          } catch {}
          reject(new Error('OTP request timed out. Please ensure this domain is authorized in Firebase Authentication and try again.'));
        }, timeoutMs)
      );

      const result = await Promise.race([sendPromise, timeoutPromise]);

      setConfirmationResult(result as ConfirmationResult);
      console.log('OTP sent successfully');
      return result as ConfirmationResult;
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
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('The current domain is not authorized for Firebase Authentication. Please add ' + window.location.hostname + ' to Authorized domains in Firebase Authentication settings.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Phone sign-in is disabled for this Firebase project. Enable the Phone provider in Firebase Console > Authentication > Sign-in method.');
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
      // Do not alter global loading state here; UI components manage their own spinners

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
