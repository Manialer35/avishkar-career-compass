import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AuthForm: React.FC = () => {
const { sendOtp, verifyOtp, loading, user } = useAuth();

const [phoneNumber, setPhoneNumber] = useState("");
const [otp, setOtp] = useState("");
const [verificationId, setVerificationId] = useState<string | null>(null);
const [step, setStep] = useState<"phone" | "otp" | "done">("phone");

const handleSendOtp = async () => {
if (!phoneNumber) return alert("Enter phone number");
const id = await sendOtp(phoneNumber);
if (id) {
setVerificationId(id);
setStep("otp");
} else {
alert("Failed to send OTP. Try again.");
}
};

const handleVerifyOtp = async () => {
if (!verificationId || !otp) return alert("Missing verification details");
const user = await verifyOtp(verificationId, otp);
if (user) {
setStep("done");
} else {
alert("Invalid code. Try again.");
}
};

if (loading) return <p>Loading...</p>;
if (step === "done") return <p>Welcome, {user?.phoneNumber || "User"} 🎉</p>;

return (
<div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
{step === "phone" && (
<> <h3>Enter your phone number</h3>
<input
type="tel"
value={phoneNumber}
onChange={(e) => setPhoneNumber(e.target.value)}
placeholder="+91XXXXXXXXXX"
style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
/>
<button onClick={handleSendOtp} style={{ width: "100%", padding: "10px" }}>
Send OTP </button>
</>
)}

  {step === "otp" && (
    <>
      <h3>Enter OTP</h3>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleVerifyOtp} style={{ width: "100%", padding: "10px" }}>
        Verify OTP
      </button>
    </>
  )}
</div>

);
};

export default AuthForm;