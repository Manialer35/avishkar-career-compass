import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CRITICAL: Listen to Firebase auth state changes
  useEffect(() => {
    console.log('Initial auth state: no user');
    
    let listenerHandle: any = null;
    let webUnsub: (() => void) | null = null;
    
    // Check current auth state on mount (native)
    FirebaseAuthentication.getCurrentUser()
      .then(({ user: currentUser }) => {
        console.log('Firebase auth state changed:', currentUser?.phoneNumber || 'no user');
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
      console.log('Firebase auth state changed:', result.user?.phoneNumber || 'logged out');
      setUser(result.user);
      setLoading(false);
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Listen for auth state changes (web)
    if (Capacitor.getPlatform() === 'web') {
      webUnsub = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Firebase WEB auth state changed:', firebaseUser?.phoneNumber || 'logged out');
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

  const sendOtp = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const result = await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
      setLoading(false);
      return result; // Return full result object
    } catch (e) {
      console.error("OTP send failed", e);
      setLoading(false);
      return null;
    }
  };

  const verifyOtp = async (verificationId: string, otp: string) => {
    setLoading(true);
    try {
      const credential = await FirebaseAuthentication.confirmVerificationCode({
        verificationId,
        verificationCode: otp,
      });
      // User state will be updated automatically by authStateChange listener
      setLoading(false);
      return credential?.user;
    } catch (e) {
      console.error("OTP verify failed", e);
      setLoading(false);
      return null;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await FirebaseAuthentication.signOut();
      // User state will be updated automatically by authStateChange listener
      setLoading(false);
    } catch (e) {
      console.error("Sign out failed", e);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ sendOtp, verifyOtp, signOut, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
