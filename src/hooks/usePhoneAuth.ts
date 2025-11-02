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
const ensureRecaptchaContainer = () => {
  if (typeof document !== 'undefined' && !document.getElementById('recaptcha-container')) {
    const div = document.createElement('div');
    div.id = 'recaptcha-container';
    div.style.display = 'none';
    document.body.appendChild(div);
  }
};

const setupRecaptcha = (): RecaptchaVerifier => {
  ensureRecaptchaContainer();
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
  await setPersistence(auth, browserLocalPersistence);
  try {
    const appVerifier = setupRecaptcha();
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
  } catch (err) {
    console.error('sendOtpWeb first attempt failed', err);
    try {
      if (recaptchaVerifier) {
        try { await (recaptchaVerifier as any).clear?.(); } catch {}
        recaptchaVerifier = null;
      }
      const appVerifier2 = setupRecaptcha();
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier2 as any);
    } catch (err2) {
      console.error('sendOtpWeb retry failed', err2);
      throw err2;
    }
  }
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
