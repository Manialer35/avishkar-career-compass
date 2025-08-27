// src/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqVcHeiwXuMXZ1cFKBelTZEHU67LOnFn8",
  authDomain: "avishkarca-86013.firebaseapp.com",
  projectId: "avishkarca-86013",
  storageBucket: "avishkarca-86013.appspot.com",
  messagingSenderId: "779694722832",
  appId: "1:779694722832:web:f2ef742787e172647e1f95",
};

// Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);

// Configure auth settings for mobile and production
auth.languageCode = 'en';

// Detect if running in Capacitor (mobile app)
const isCapacitor = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';
const isMobile = typeof window !== 'undefined' && (
  /Android/i.test(navigator.userAgent) || 
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  isCapacitor
);

if (typeof window !== 'undefined') {
  // Configure auth settings based on environment
  const isDevelopment = window.location.hostname === 'localhost';
  const isLovablePreview = window.location.hostname.includes('lovable.app') || 
                           window.location.hostname.includes('lovableproject.com');
  
  // Only disable verification for development and preview environments
  // For production mobile apps (Capacitor), keep verification enabled
  if (isDevelopment || isLovablePreview) {
    auth.settings.appVerificationDisabledForTesting = true;
  } else {
    // For production (both web and mobile), enable verification
    auth.settings.appVerificationDisabledForTesting = false;
  }
}

export { app };
