import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { GOOGLE_WEB_CLIENT_ID } from "@/config/google";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('Setting up auth listeners');
    
    let listenerHandle: any = null;
    let webUnsub: (() => void) | null = null;

    // Listen for auth state changes (native)
    FirebaseAuthentication.addListener('authStateChange', (result) => {
      console.log('Firebase native auth state changed:', result.user?.email || 'logged out');
      setUser(result.user);
      setLoading(false);
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Listen for auth state changes (web) - unified listener for web and fallback
    webUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase web auth state changed:', firebaseUser?.email || 'logged out');
      setUser(firebaseUser);
      setLoading(false);
    });

    // Check current auth state on mount
    FirebaseAuthentication.getCurrentUser()
      .then(({ user: currentUser }) => {
        console.log('Initial Firebase auth state:', currentUser?.email || 'no user');
        if (currentUser) {
          setUser(currentUser);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth state check failed:', error);
        setLoading(false);
      });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      if (webUnsub) {
        webUnsub();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const isNative = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
      console.log('Google sign-in on platform:', Capacitor.getPlatform());
      
      if (isNative) {
        // Try native sign-in first on Android/iOS
        try {
          console.log('Attempting native Google sign-in...');
          const result = await FirebaseAuthentication.signInWithGoogle();
          console.log('Native sign-in successful:', result.user?.email);
          setLoading(false);
          return result.user;
        } catch (nativeError: any) {
          // Check for user cancellation
          if (nativeError?.code === '12501' || 
              nativeError?.message?.toLowerCase().includes('cancel')) {
            console.log('User cancelled sign-in');
            setLoading(false);
            return null;
          }

          // Try web credential fallback
          console.log('Native sign-in failed, trying web credential fallback...');
          try {
            const webResult = await (FirebaseAuthentication as any).signInWithGoogle({
              skipNativeAuth: true,
              scopes: ['profile', 'email', 'openid'],
              serverClientId: GOOGLE_WEB_CLIENT_ID,
            });

            const idToken = webResult?.credential?.idToken;
            const accessToken = webResult?.credential?.accessToken;

            if (idToken || accessToken) {
              const credential = GoogleAuthProvider.credential(idToken || null, accessToken);
              const authResult = await signInWithCredential(auth, credential);
              console.log('Web credential sign-in successful:', authResult.user?.email);
              setLoading(false);
              return authResult.user;
            }
          } catch (webError) {
            console.error('Web credential fallback failed:', webError);
          }

          setLoading(false);
          throw nativeError;
        }
      } else {
        // Web platform
        console.log('Starting web Google sign-in...');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Web sign-in successful:', result.user?.email);
        setLoading(false);
        return result.user;
      }
    } catch (e: any) {
      console.error("Google sign-in failed:", e);
      setLoading(false);
      
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        return null;
      }
      
      throw e;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await FirebaseAuthentication.signOut();
      setLoading(false);
    } catch (e) {
      console.error("Sign out failed", e);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ signInWithGoogle, signOut, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
