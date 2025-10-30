import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DomainErrorAlert from './DomainErrorAlert';
import TestAuth from './TestAuth';

const AuthForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDomainError, setShowDomainError] = useState(false);
  const [message, setMessage] = useState<string>("");
  const { toast } = useToast();
  const { signInWithPhone, verifyOtp, confirmationResult } = useAuth();

  // Always use Firebase phone auth in production
  // TestAuth is only for local development testing
  const isLocalDevelopment = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost' && 
    window.location.protocol === 'http:';
  
  if (isLocalDevelopment) {
    return <TestAuth />;
  }

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setShowDomainError(false);

    if (!phoneNumber.trim()) {
      setMessage("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithPhone(phoneNumber);
      setMessage("✅ OTP sent successfully! Please check your phone.");
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      let errorMessage = "Failed to send OTP. ";
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage += "Please enter a valid phone number with country code (e.g., +91xxxxxxxxxx)";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage += "Too many requests. Please try again later.";
      } else if (error.message.includes('reCAPTCHA verification failed') || 
                 error.message.includes('authorized domain')) {
        errorMessage += error.message;
        setShowDomainError(true);
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setMessage(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationResult) {
      setMessage("Please send OTP first");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter the OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await verifyOtp(confirmationResult, otp);
      setMessage("✅ Phone number verified successfully! Redirecting...");
      
      toast({
        title: "Login Successful",
        description: "Phone number verified successfully!",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error: any) {
      let errorMessage = "Invalid OTP. ";
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage += "Please check the code and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage += "The verification code has expired. Please request a new one.";
      } else {
        errorMessage += error.message || "Please try again.";
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Phone Verification</h1>
        <p className="text-gray-600 mt-2">
          {!confirmationResult ? "Enter your phone number" : "Enter the verification code"}
        </p>
      </div>

      {/* Domain Error Alert */}
      {showDomainError && (
        <div className="mb-6">
          <DomainErrorAlert currentDomain={window.location.hostname} />
        </div>
      )}

      {/* Messages */}
      {message && (
        <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {!confirmationResult ? (
        /* Phone Number Form */
        <form onSubmit={sendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 8888769281"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +91 for India)
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !phoneNumber}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        /* OTP Verification Form */
        <form onSubmit={verifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center"
              disabled={loading}
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !otp}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setOtp("");
              setMessage("");
              setShowDomainError(false);
            }}
            disabled={loading}
          >
            Change Phone Number
          </Button>
        </form>
      )}

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {/* Admin Test Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">Admin Access</h3>
        <p className="text-blue-700">
          Admin Number: +91 8888769281<br />
          Regular users can use any valid number
        </p>
      </div>
    </div>
  );
};

export default AuthForm;