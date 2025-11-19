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

    // Listen for auth state changes (web) - also on native to support fallback via web SDK
    webUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase WEB auth state changed:', firebaseUser?.email || 'logged out');
      // Only update if native user is not set to avoid flicker; but keep it in sync as a fallback
      setUser((prev) => prev ?? firebaseUser);
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
      console.log('🔐 signInWithGoogle - Platform:', Capacitor.getPlatform(), 'Native:', isNative);
      
      if (isNative) {
        // Try native Google sign-in first
        try {
          console.log('🚀 Attempting native Google sign-in...');
          const result = await FirebaseAuthentication.signInWithGoogle({
            mode: 'popup'
          });
          
          console.log('✅ Native Google sign-in SUCCESS');
          console.log('User email:', result.user?.email);
          console.log('User ID:', result.user?.uid);
          
          setLoading(false);
          return result.user;
        } catch (nativeError: any) {
          console.error('❌ Native sign-in failed:', nativeError.message || nativeError);
          console.error('Error code:', nativeError.code);
          console.error('Full error:', JSON.stringify(nativeError, null, 2));
          console.error('Native sign-in ERROR details:', {
            code: nativeError?.code,
            message: nativeError?.message,
            error: JSON.stringify(nativeError)
          });

          // On Android, sometimes the plugin throws errors even on success
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { user: currentUser } = await FirebaseAuthentication.getCurrentUser();
          if (currentUser) {
            console.log('Native sign-in succeeded despite error, user found:', currentUser.email);
            setLoading(false);
            return currentUser;
          }
          
          // Check for user cancellation
          if (nativeError?.code === '12501' ||
              nativeError?.code === 'auth/popup-closed-by-user' ||
              nativeError?.message?.toLowerCase().includes('cancel') ||
              nativeError?.message?.toLowerCase().includes('12501')) {
            console.log('⚠️ User cancelled sign-in');
            setLoading(false);
            return null;
          }

          // Throw the error to be handled by outer catch
          throw nativeError;
        }
      } else {
        // Web platform - use popup
        console.log('🌐 Starting web Google sign-in...');
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Web sign-in SUCCESS:', result.user?.email);
        
        setLoading(false);
        return result.user;
      }
    } catch (e: any) {
      console.error("❌ Google sign-in failed (outer catch):", e.message || e);
      setLoading(false);
      
      // Don't throw on user cancellation
      if (e?.code === 'auth/popup-closed-by-user' || 
          e?.code === 'auth/cancelled-popup-request' ||
          e?.code === '12501' ||
          e?.message?.toLowerCase().includes('cancel')) {
        console.log('⚠️ Sign-in cancelled by user');
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
