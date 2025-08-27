
import { auth } from "@/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  signOut,
  ConfirmationResult,
} from "firebase/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

// Detect if running in mobile environment
const isMobileApp = () => {
  if (typeof window === 'undefined') return false;
  const isCapacitor = window.location.protocol === 'capacitor:';
  const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isCapacitor || isMobileUA;
};

const setupRecaptcha = () => {
  // Skip reCAPTCHA setup for mobile apps
  if (isMobileApp()) {
    console.log('Skipping reCAPTCHA setup for mobile environment');
    return null;
  }

  // Must match the DOM id you'll add in Auth.tsx
  if (!recaptchaVerifier) {
    try {
      recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { 
          size: "invisible",
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          }
        }
      );
    } catch (error) {
      console.error('Failed to setup reCAPTCHA:', error);
      return null;
    }
  }
  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    const appVerifier = setupRecaptcha();
    
    // For mobile apps or when reCAPTCHA fails, try without verifier
    if (!appVerifier || isMobileApp()) {
      console.log('Attempting phone auth without reCAPTCHA for mobile environment');
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
    }
    
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error: any) {
    console.error('Phone auth error:', error);
    
    // If reCAPTCHA fails, try again without it for mobile
    if (error.code === 'auth/invalid-app-credential' || 
        error.code === 'auth/captcha-check-failed' ||
        error.message.includes('reCAPTCHA')) {
      console.log('Retrying phone auth without reCAPTCHA');
      return await signInWithPhoneNumber(auth, phoneNumber, null as any);
    }
    
    throw error;
  }
};

export const verifyOtp = async (confirmation: ConfirmationResult, code: string) => {
  // keep the user signed-in on next app open
  await setPersistence(auth, browserLocalPersistence);
  const cred = await confirmation.confirm(code);
  return cred.user;
};

export const logoutPhoneAuth = () => signOut(auth);
