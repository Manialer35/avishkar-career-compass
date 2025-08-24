
import { auth } from "@/lib/firebase"; // Use the correct firebase config
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  signOut,
  ConfirmationResult,
} from "firebase/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

const setupRecaptcha = () => {
  // Must match the DOM id you'll add in Auth.tsx
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  }
  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
  const appVerifier = setupRecaptcha();
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const verifyOtp = async (confirmation: ConfirmationResult, code: string) => {
  // keep the user signed-in on next app open
  await setPersistence(auth, browserLocalPersistence);
  const cred = await confirmation.confirm(code);
  return cred.user;
};

export const logoutPhoneAuth = () => signOut(auth);
