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

    // Unified auth state change handler
    const handleAuthStateChange = (authUser: any) => {
      console.log('Auth state changed:', authUser?.email || 'logged out');
      setUser(authUser);
      setLoading(false);
    };

    // Listen for auth state changes (native)
    FirebaseAuthentication.addListener('authStateChange', (result) => {
      handleAuthStateChange(result.user);
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Listen for auth state changes (web)
    webUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      handleAuthStateChange(firebaseUser);
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
        console.log('Attempting native Google sign-in...');
        const result = await FirebaseAuthentication.signInWithGoogle({
          scopes: ['email', 'profile'],
        });
        console.log('Native sign-in successful:', result.user?.email);
        setLoading(false);
        return result.user;
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
      console.error("Google sign-in failed with code:", e?.code, "message:", e?.message);
      console.error("Full error:", JSON.stringify(e, null, 2));
      setLoading(false);
      
      // User cancelled
      if (e?.code === '12501' || 
          e?.code === 'auth/popup-closed-by-user' || 
          e?.code === 'auth/cancelled-popup-request' ||
          e?.message?.toLowerCase().includes('cancel')) {
        console.log('User cancelled sign-in');
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
