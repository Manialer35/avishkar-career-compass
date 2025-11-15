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
      console.log('signInWithGoogle platform:', Capacitor.getPlatform(), 'isNative:', isNative);
      
      if (isNative) {
        console.log('Starting native Google sign-in...');
        
        try {
          const result = await FirebaseAuthentication.signInWithGoogle();
          console.log('Native sign-in SUCCESS:', JSON.stringify(result));
          setLoading(false);
          return result.user;
        } catch (nativeError: any) {
          console.error('Native sign-in ERROR details:', {
            code: nativeError?.code,
            message: nativeError?.message,
            error: JSON.stringify(nativeError)
          });
          
          // On Android, sometimes the plugin throws errors even on success
          // Wait a moment for auth state to update, then check if user is signed in
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { user: currentUser } = await FirebaseAuthentication.getCurrentUser();
          if (currentUser) {
            console.log('Native sign-in succeeded despite error, user found:', currentUser.email);
            setLoading(false);
            return currentUser;
          }
          
          // If still no user, check for cancellation
          if (nativeError?.code === '12501' || // SIGN_IN_CANCELLED
              nativeError?.message?.toLowerCase().includes('cancel') ||
              nativeError?.message?.toLowerCase().includes('12501')) {
            console.log('User cancelled native sign-in');
            setLoading(false);
            return null;
          }
          // Try web-credential fallback inside the WebView
          try {
            console.log('Attempting web credential fallback...');
            const fallback = await (FirebaseAuthentication as any).signInWithGoogle({
              skipNativeAuth: true,
              scopes: ['profile', 'email', 'openid'],
              serverClientId: GOOGLE_WEB_CLIENT_ID,
            } as any);
            const idToken = (fallback as any)?.credential?.idToken;
            const accessToken = (fallback as any)?.credential?.accessToken;
            console.log('Fallback tokens', { hasIdToken: !!idToken, hasAccessToken: !!accessToken });
            if (idToken || accessToken) {
              const credential = GoogleAuthProvider.credential(idToken || null, accessToken || undefined);
              const webResult = await signInWithCredential(auth, credential);
              console.log('Web credential fallback SUCCESS:', webResult.user?.email);
              setLoading(false);
              return webResult.user;
            }
          } catch (fallbackErr) {
            console.error('Web credential fallback failed:', fallbackErr);
          }
          
          setLoading(false);
          throw nativeError;
        }
      } else {
        console.log('Starting web Google sign-in...');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Web sign-in result:', result.user);
        
        setLoading(false);
        return result.user;
      }
    } catch (e: any) {
      console.error("Google sign in failed (outer catch):", e);
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
