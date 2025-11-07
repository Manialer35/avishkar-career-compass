import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('Setting up auth listeners');
    
    let listenerHandle: any = null;
    let webUnsub: (() => void) | null = null;
    
    // Check current auth state on mount (native)
    FirebaseAuthentication.getCurrentUser()
      .then(({ user: currentUser }) => {
        console.log('Firebase auth state:', currentUser?.email || 'no user');
        setUser(currentUser);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth state check failed:', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth state changes (native)
    FirebaseAuthentication.addListener('authStateChange', (result) => {
      console.log('Firebase auth state changed:', result.user?.email || 'logged out');
      setUser(result.user);
      setLoading(false);
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Listen for auth state changes (web)
    if (Capacitor.getPlatform() === 'web') {
      webUnsub = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Firebase WEB auth state changed:', firebaseUser?.email || 'logged out');
        setUser(firebaseUser);
        setLoading(false);
      });
    }

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
      
      if (isNative) {
        console.log('Starting native Google sign-in...');
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log('Native sign-in result:', result);
        
        // The auth state listener will handle setting the user
        setLoading(false);
        return result.user;
      } else {
        console.log('Starting web Google sign-in...');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Web sign-in result:', result.user);
        
        // The auth state listener will handle setting the user
        setLoading(false);
        return result.user;
      }
    } catch (e: any) {
      console.error("Google sign in failed:", e);
      setLoading(false);
      
      // Don't throw on user cancellation
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
