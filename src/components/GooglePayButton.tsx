
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";

interface GooglePayButtonProps {
  productId: string;
  productName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const GooglePayButton = ({ productId, productName, price, onSuccess, onCancel }: GooglePayButtonProps) => {
  const { toast } = useToast();
  const [paymentAvailable, setPaymentAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Production Razorpay credentials
  const razorpayKeyId = "rzp_live_OCL24jX6vVdT6W";

  useEffect(() => {
    loadPaymentScripts();
  }, []);

  const loadPaymentScripts = async () => {
    try {
      // Load Razorpay script
      const razorpayScript = document.createElement('script');
      razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
      razorpayScript.async = true;
      document.body.appendChild(razorpayScript);

      razorpayScript.onload = () => {
        console.log("Razorpay script loaded successfully");
        setPaymentAvailable(true);
      };

      razorpayScript.onerror = () => {
        console.error("Error loading Razorpay script");
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please try again later.",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('Error loading payment scripts:', error);
    }
  };

  const createRazorpayOrder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: price * 100, // Convert to paise
          currency: 'INR',
          productId: productId,
          productName: productName,
          customerId: user?.id,
          customerEmail: user?.email
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          productId: productId,
          userId: user?.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const processPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the payment.",
        variant: "destructive",
      });
      return;
    }

    if (!window.Razorpay) {
      toast({
        title: "Payment System Unavailable",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting Razorpay payment process...");
      
      // Create order
      const orderData = await createRazorpayOrder();
      
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Study Academy',
        description: `Payment for ${productName}`,
        order_id: orderData.id,
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        handler: async (response: any) => {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Verify payment
            const verification = await verifyPayment(response);
            
            if (verification.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully.",
              });
              onSuccess();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
            onCancel();
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "default",
            });
            onCancel();
          },
        },
        theme: {
          color: '#1e3a8a',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={processPayment}
      disabled={isLoading || !paymentAvailable}
      className="w-full bg-[#528FF0] hover:bg-[#4285f4] flex items-center justify-center gap-2 py-3 text-white"
    >
      {isLoading ? (
        "Processing..."
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
          </svg>
          <span>Pay ₹{price}</span>
        </>
      )}
    </Button>
  );
};

export default GooglePayButton;
