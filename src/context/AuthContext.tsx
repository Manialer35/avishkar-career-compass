import React, { createContext, useContext, useState } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const result = await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
      setLoading(false);
      return result.verificationId;
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
      setUser(credential?.user || null);
      setLoading(false);
      return credential?.user;
    } catch (e) {
      console.error("OTP verify failed", e);
      setLoading(false);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ sendOtp, verifyOtp, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
