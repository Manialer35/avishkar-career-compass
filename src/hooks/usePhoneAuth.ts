// src/hooks/usePhoneAuth.ts
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "@/firebase"; // for web fallback
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  signOut,
  ConfirmationResult,
} from "firebase/auth"; // ✅ fixed import path (no space)

let recaptchaVerifier: RecaptchaVerifier | null = null;

const isNative = () =>
  Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios";

// ---- NATIVE METHODS ----
export const sendOtpNative = async (phoneNumber: string) => {
  const result = await FirebaseAuthentication.signInWithPhoneNumber({
    phoneNumber,
  });
  return result; // Return full result object
};

export const verifyCodeNative = async (verificationId: string, code: string) => {
  const credentialResult = await FirebaseAuthentication.confirmVerificationCode({
    verificationId,
    verificationCode: code,
  });
  return credentialResult; // contains user info or token
};

// ---- WEB METHODS ----
const setupRecaptcha = (): RecaptchaVerifier => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  }
  return recaptchaVerifier;
};

export const sendOtpWeb = async (
  phoneNumber: string
): Promise<ConfirmationResult> => {
  const appVerifier = setupRecaptcha();
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
  return confirmation;
};

export const verifyOtpWeb = async (
  confirmation: ConfirmationResult,
  code: string
) => {
  await setPersistence(auth, browserLocalPersistence);
  const cred = await confirmation.confirm(code);
  return cred.user;
};

export const logoutPhoneAuth = () => signOut(auth);
