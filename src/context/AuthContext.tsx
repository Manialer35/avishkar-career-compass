import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  getSupabaseToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create user profile and role in Supabase
const createUserProfile = async (firebaseUser: any) => {
  if (!firebaseUser) return;
  
  try {
    const userId = firebaseUser.uid || firebaseUser.localId;
    const email = firebaseUser.email;
    const displayName = firebaseUser.displayName || firebaseUser.name;
    const photoURL = firebaseUser.photoURL || firebaseUser.photoUrl;
    
    console.log('[AuthContext] Creating profile for user:', userId, 'email:', email);
    
    const { data, error } = await supabase.functions.invoke('create-user-profile', {
      body: {
        firebaseUserId: userId,
        username: email ? email.split('@')[0] : `user_${userId.substring(0, 8)}`,
        fullName: displayName || null,
        avatarUrl: photoURL || null,
        email: email,
        phoneNumber: firebaseUser.phoneNumber || null
      }
    });
    
    if (error) {
      console.error('[AuthContext] Error creating profile:', error);
    } else {
      console.log('[AuthContext] Profile created/updated:', data);
    }
  } catch (error) {
    console.error('[AuthContext] Exception creating profile:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('Setting up auth listeners');
    
    const isNative = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
    let listenerHandle: any = null;
    let webUnsub: (() => void) | null = null;

    // Unified auth state change handler
    const handleAuthStateChange = async (authUser: any) => {
      console.log('Auth state changed:', authUser?.email || 'logged out');
      
      // Create/update profile when user signs in
      if (authUser) {
        await createUserProfile(authUser);
      }
      
      setUser(authUser);
      setLoading(false);
    };

    if (isNative) {
      // Native: Use Capacitor Firebase Authentication
      console.log('Setting up native auth listener');
      
      // First check current user
      FirebaseAuthentication.getCurrentUser()
        .then(async ({ user: currentUser }) => {
          console.log('Initial Firebase auth state:', currentUser?.email || 'no user');
          await handleAuthStateChange(currentUser);
        })
        .catch((error) => {
          console.error('Auth state check failed:', error);
          setLoading(false);
        });

      // Then listen for changes
      FirebaseAuthentication.addListener('authStateChange', async (result) => {
        await handleAuthStateChange(result.user);
      }).then((handle) => {
        listenerHandle = handle;
      });
    } else {
      // Web: Use Firebase web SDK
      console.log('Setting up web auth listener');
      webUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
        await handleAuthStateChange(firebaseUser);
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

  const getSupabaseToken = async () => {
    try {
      const isNative = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
      
      if (isNative) {
        // For native platforms, get ID token from Firebase Authentication
        const result = await FirebaseAuthentication.getIdToken();
        return result.token;
      } else {
        // For web, get ID token from Firebase auth
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
        const token = await currentUser.getIdToken();
        return token;
      }
    } catch (error) {
      console.error('Error getting Supabase token:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ signInWithGoogle, signOut, user, loading, getSupabaseToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
