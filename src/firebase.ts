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
  const isCapacitorApp = !!(window as any).Capacitor;
  const isDevelopmentWeb = window.location.hostname === 'localhost' && !isCapacitorApp;

  // IMPORTANT: Never disable app verification in production (web or mobile)
  auth.settings.appVerificationDisabledForTesting = isDevelopmentWeb;
}

export { app };
