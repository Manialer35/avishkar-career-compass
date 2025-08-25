
// src/components/auth/AuthForm.tsx
import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


const AuthForm: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const { toast } = useToast();

  // Initialize Recaptcha only once
  const setUpRecaptcha = () => {
    // Don't recreate if already exists and working
    if (window.recaptchaVerifier) {
      console.log('RecaptchaVerifier already exists');
      return window.recaptchaVerifier;
    }
    
    try {
      console.log('Setting up RecaptchaVerifier');
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          }
        }
      );
      console.log('RecaptchaVerifier setup complete');
      return window.recaptchaVerifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw error;
    }
  };

  // Send OTP
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate phone number format
    if (!phone || !phone.startsWith("+") || phone.length < 10) {
      setMessage("Please enter a valid phone number with country code (e.g. +918888769281)");
      setLoading(false);
      return;
    }

    try {
      console.log('Starting OTP send process for phone:', phone);
      
      // Set up recaptcha
      const recaptchaVerifier = setUpRecaptcha();
      
      console.log('Attempting to send OTP with Firebase');
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone.trim(),
        recaptchaVerifier
      );

      console.log('OTP request successful');
      setConfirmationResult(confirmation);
      setStep("otp");
      setMessage("📱 OTP sent! Check your messages (may take 1-2 minutes)");
      
      toast({
        title: "OTP Sent Successfully",
        description: `Verification code sent to ${phone}`,
      });
      
      // Development mode notice
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          setMessage("🧪 Development Mode: If you don't receive SMS, try using test number +918888769281 with OTP 123456");
        }, 3000);
      }
      
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = "Failed to send OTP. ";
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage += "Too many attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage += "Invalid phone number format.";
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage += "SMS quota exceeded. Please try again later.";
      } else if (error.code === 'auth/recaptcha-not-enabled') {
        errorMessage += "reCAPTCHA not enabled. Please contact support.";
      } else if (error.code === 'auth/app-not-authorized') {
        errorMessage += "App not authorized for SMS. Please contact support.";
      } else {
        errorMessage += `Please check your phone number and try again. (${error.code || 'Unknown error'})`;
      }
      
      // Only clear recaptcha on specific errors
      if (error.code === 'auth/captcha-check-failed' || error.message?.includes('reCAPTCHA')) {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            console.log('Error clearing reCAPTCHA:', e);
          }
          window.recaptchaVerifier = null;
        }
      }
      
      setMessage(errorMessage);
      toast({
        title: "Error sending OTP",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    
    setLoading(true);
    setMessage("");

    try {
      console.log('Verifying OTP:', otp);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log("User signed in:", user);
      setMessage("✅ Login successful! Redirecting...");
      
      toast({
        title: "Login Successful",
        description: `Welcome ${user.phoneNumber}!`,
      });
      
      // Auto redirect after success
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let errorMessage = "Invalid OTP. ";
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage += "Please check the code and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage += "Code expired. Please request a new OTP.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setMessage(errorMessage);
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setConfirmationResult(null);
    setMessage("");
    setLoading(false);
    
    // Clear recaptcha when resetting
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log('Error clearing reCAPTCHA:', e);
      }
      window.recaptchaVerifier = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Phone Verification</h1>
        <p className="text-gray-600 mt-2">
          {step === "phone" ? "Enter your phone number" : "Enter verification code"}
        </p>
      </div>

      {message && (
        <Alert className={message.includes("✅") || message.includes("📱") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("✅") || message.includes("📱") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {step === "phone" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +91 for India)
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !phone}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-lg tracking-widest"
              disabled={loading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to {phone}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={resetForm}
              disabled={loading}
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      )}

      {/* Required Recaptcha container */}
      <div id="recaptcha-container" style={{ height: 0, overflow: "hidden" }} />
      
      {/* Development notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
          <strong>Development Mode:</strong> If SMS is not working, check Firebase console for billing and SMS configuration.
        </div>
      )}
    </div>
  );
};

export default AuthForm;
