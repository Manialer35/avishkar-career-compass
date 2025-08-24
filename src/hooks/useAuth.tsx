
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase'; // Use the correct firebase config
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmationResult: ConfirmationResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener only
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      if (firebaseUser) {
        console.log('User signed in:', firebaseUser.phoneNumber);
        toast({
          title: "Signed in successfully",
          description: `Welcome ${firebaseUser.phoneNumber}!`,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  const signInWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      console.log('Sending OTP to phone:', phone);
      
      if (!window.recaptchaVerifier) {
        throw new Error('RecaptchaVerifier not initialized. Please ensure the auth form is loaded.');
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      
      setConfirmationResult(confirmationResult);
      console.log('OTP sent successfully');
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    try {
      console.log('Verifying OTP');
      const result = await confirmationResult.confirm(otp);
      
      console.log('OTP verification successful', result.user);
      setConfirmationResult(null);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setConfirmationResult(null);
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithPhone,
    verifyOtp,
    signOut,
    confirmationResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
