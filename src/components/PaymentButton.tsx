// src/components/PaymentButton.tsx
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface RazorpayWindow extends Window {
  Razorpay: any;
}

declare let window: RazorpayWindow;

async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const PaymentButton: React.FC<{ amountRs: number }> = ({ amountRs }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1) call backend to create order (expects amount in rupees)
      const res = await fetch("/functions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountRs })
      });
      const order = await res.json();
      // order should be razorpay's order object (id, amount, currency)

      // 2) ensure Razorpay script is loaded
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Could not load Razorpay script");

      // 3) options for checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount, // in paise (returned by server)
        currency: order.currency || "INR",
        name: "Career Compass",
        description: "Payment",
        order_id: order.id, // razorpay order id
        prefill: {
          contact: user?.phoneNumber ?? "",
        },
        handler: async (response: any) => {
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Verify on server
          const verify = await fetch("/functions/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyJson = await verify.json();
          if (verifyJson?.verified) {
            alert("Payment verified! 🎉");
            // update local order status, show receipt, etc
          } else {
            alert("Payment verification failed. Contact admin.");
          }
        },
        // optional: onDismiss
        modal: {
          ondismiss: () => {
            console.log("User dismissed payment");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "Processing..." : `Pay ₹${amountRs}`}
    </button>
  );
};
