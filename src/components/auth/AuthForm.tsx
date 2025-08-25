
// src/components/auth/AuthForm.tsx
import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


const AuthForm: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"phone" | "otp" | "email">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const { toast } = useToast();

  // Test phone numbers that bypass Firebase rate limits
  const TEST_NUMBERS = ["+918888769281", "+911234567890", "+911111111111"];
  
  const isTestNumber = (phoneNum: string) => {
    return TEST_NUMBERS.includes(phoneNum.replace(/\s/g, ''));
  };

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
        errorMessage += "Too many attempts. Please try again later or use email login below.";
        setShowEmailFallback(true);
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

  // Email authentication functions
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        // Sign up with Supabase
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        // Sign in with Supabase
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (isSignUp && !result.data.session) {
        setMessage("✅ Account created! Please check your email to confirm your account.");
      } else {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }

      toast({
        title: isSignUp ? "Account Created" : "Login Successful",
        description: isSignUp ? "Please check your email to confirm" : `Welcome back!`,
      });

    } catch (error: any) {
      console.error("Email auth error:", error);
      let errorMessage = isSignUp ? "Failed to create account. " : "Failed to sign in. ";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage += "Invalid email or password.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage += "Account already exists. Try signing in instead.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage += "Password must be at least 6 characters.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setMessage(errorMessage);
      toast({
        title: isSignUp ? "Signup Failed" : "Login Failed",
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
    setEmail("");
    setPassword("");
    setOtp("");
    setConfirmationResult(null);
    setMessage("");
    setLoading(false);
    setShowEmailFallback(false);
    setIsSignUp(false);
    
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {authMethod === "email" ? "Email Authentication" : "Phone Verification"}
        </h1>
        <p className="text-gray-600 mt-2">
          {step === "phone" ? "Enter your phone number" : 
           step === "otp" ? "Enter verification code" : 
           isSignUp ? "Create your account" : "Sign in to your account"}
        </p>
      </div>

      {/* Auth method switcher */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <Button
          type="button"
          variant={authMethod === "phone" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => {
            setAuthMethod("phone");
            setStep("phone");
            setMessage("");
          }}
          disabled={loading}
        >
          Phone
        </Button>
        <Button
          type="button"
          variant={authMethod === "email" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => {
            setAuthMethod("email");
            setStep("email");
            setMessage("");
          }}
          disabled={loading}
        >
          Email
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={message.includes("✅") || message.includes("📱") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("✅") || message.includes("📱") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Phone Authentication */}
      {authMethod === "phone" && step === "phone" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+918888769281"
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

          {/* Test number hint */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
            <strong>Quick Test:</strong> Use +918888769281 with any 6-digit OTP (e.g., 123456)
          </div>
        </form>
      )}

      {/* OTP Verification */}
      {authMethod === "phone" && step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder={isTestNumber(phone) ? "123456" : "Enter 6-digit code"}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-lg tracking-widest"
              disabled={loading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isTestNumber(phone) 
                ? "Test number: Enter any 6 digits (e.g., 123456)" 
                : `Enter the 6-digit code sent to ${phone}`}
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

      {/* Email Authentication */}
      {authMethod === "email" && (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              disabled={loading}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters required
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email || !password}
          >
            {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : 
             (isSignUp ? "Create Account" : "Sign In")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </form>
      )}

      {/* Rate limit email fallback */}
      {showEmailFallback && authMethod === "phone" && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h3 className="font-medium text-orange-800 mb-2">Phone SMS Rate Limited</h3>
          <p className="text-sm text-orange-700 mb-3">
            Too many SMS attempts. You can either wait 30 minutes or use email authentication instead.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setAuthMethod("email");
              setStep("email");
              setShowEmailFallback(false);
            }}
          >
            Switch to Email Login
          </Button>
        </div>
      )}

      {/* Required Recaptcha container */}
      <div id="recaptcha-container" style={{ height: 0, overflow: "hidden" }} />
      
      {/* Development notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
          <strong>Development Mode:</strong> Use test numbers above or email auth. SMS requires Firebase billing setup.
        </div>
      )}
    </div>
  );
};

export default AuthForm;
