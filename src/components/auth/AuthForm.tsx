import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { sendOtpWeb, verifyOtpWeb } from "@/hooks/usePhoneAuth";
import type { ConfirmationResult } from "firebase/auth";
import DomainErrorAlert from "./DomainErrorAlert";

const AuthForm: React.FC = () => {
const { sendOtp, verifyOtp, loading, user } = useAuth();

const platform = Capacitor.getPlatform();
const isNative = platform === "android" || platform === "ios";

const [phoneNumber, setPhoneNumber] = useState("");
const [otp, setOtp] = useState("");
const [verificationId, setVerificationId] = useState<string | null>(null);
const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
const [showDomainError, setShowDomainError] = useState(false);

const handleSendOtp = async () => {
  const normalized = phoneNumber.replace(/\s+/g, '');
  if (!normalized) {
    toast.error("Please enter phone number");
    return;
  }
  if (!normalized.startsWith('+')) {
    toast.error("Phone number must start with country code (e.g., +91)");
    return;
  }
  try {
    if (isNative) {
      const result = await sendOtp(normalized);
      if (result && (result as any).verificationId) {
        setVerificationId((result as any).verificationId);
        setStep("otp");
        toast.success("OTP sent successfully!");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } else {
      const conf = await sendOtpWeb(normalized);
      setConfirmation(conf);
      setStep("otp");
      toast.success("OTP sent successfully!");
    }
  } catch (error: any) {
    console.error("Send OTP error:" , error?.code || error?.message || error);
    const code = error?.code as string | undefined;
    const errorMessage = error?.message || '';
    
    // Check for domain authorization error
    if (code === 'auth/unauthorized-domain' || errorMessage.includes('domain') || errorMessage.includes('Invalid domain')) {
      setShowDomainError(true);
      toast.error("Domain not authorized. See instructions below.");
      return;
    }
    
    const map: Record<string,string> = {
      'auth/invalid-phone-number': 'Invalid phone number format',
      'auth/too-many-requests': 'Too many attempts. Try again later',
      'auth/app-not-authorized': 'App not authorized. Check Firebase config',
      'auth/internal-error': 'Temporary issue. Try again later',
      'auth/unauthorized-domain': 'Domain not authorized for phone auth',
    };
    toast.error(map[code || ''] || "Failed to send OTP. Please check your phone number.");
  }
};

const handleVerifyOtp = async () => {
if (isNative) {
  if (!verificationId || !otp) {
    toast.error("Please enter the OTP code");
    return;
  }
  try {
    const user = await verifyOtp(verificationId, otp);
    if (user) {
      setStep("done");
      toast.success("Successfully logged in!");
    } else {
      toast.error("Invalid OTP code. Please try again.");
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    toast.error("Invalid OTP code. Please try again.");
  }
} else {
  if (!confirmation || !otp) {
    toast.error("Please enter the OTP code");
    return;
  }
  try {
    const user = await verifyOtpWeb(confirmation, otp);
    if (user) {
      setStep("done");
      toast.success("Successfully logged in!");
    } else {
      toast.error("Invalid OTP code. Please try again.");
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    toast.error("Invalid OTP code. Please try again.");
  }
}
};

if (loading) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

if (step === "done") {
  return (
    <div className="text-center py-8">
      <h3 className="text-2xl font-bold text-foreground mb-2">Welcome!</h3>
      <p className="text-muted-foreground">{user?.phoneNumber || "User"}</p>
    </div>
  );
}

return (
  <div className="w-full space-y-6">
    {showDomainError && (
      <DomainErrorAlert currentDomain={window.location.hostname} />
    )}
    
    {step === "phone" && (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Include country code (e.g., +91 for India)
          </p>
        </div>
        <Button 
          onClick={handleSendOtp} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    )}

    {step === "otp" && (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full text-center text-2xl tracking-widest"
          />
          <p className="text-sm text-muted-foreground">
            Check your phone for the verification code
          </p>
        </div>
        <Button 
          onClick={handleVerifyOtp} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Button 
          onClick={() => setStep("phone")} 
          variant="outline"
          className="w-full"
        >
          Change Phone Number
        </Button>
      </div>
    )}
    <div id="recaptcha-container"></div>
  </div>
);
};

export default AuthForm;