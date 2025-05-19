
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

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (options: any) => any;
        }
      }
    }
  }
}

const GooglePayButton = ({ productId, productName, price, onSuccess, onCancel }: GooglePayButtonProps) => {
  const { toast } = useToast();
  const [googlePayAvailable, setGooglePayAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Your actual Google Pay merchant ID
  const merchantId = "BCR2DN4TTWA2JCD6";

  useEffect(() => {
    // Load Google Pay API script
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => {
      console.log("Google Pay script loaded successfully");
      checkGooglePayAvailability();
    };
    script.onerror = () => {
      console.error("Error loading Google Pay script");
      toast({
        title: "Payment Error",
        description: "Failed to load Google Pay. Please try again later.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts if it exists
      const scriptElement = document.querySelector('script[src="https://pay.google.com/gp/p/js/pay.js"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  const checkGooglePayAvailability = async () => {
    if (!window.google?.payments?.api?.PaymentsClient) {
      console.error('Google Pay API not available');
      return;
    }

    try {
      console.log("Checking Google Pay availability...");
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // Use 'TEST' for development, 'PRODUCTION' for live
      });

      const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER', 'JCB']
          }
        }]
      };

      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
      console.log("Google Pay availability checked:", response.result);
      setGooglePayAvailable(response.result);
    } catch (error) {
      console.error('Error checking Google Pay availability:', error);
      setGooglePayAvailable(false);
    }
  };

  const processPayment = async () => {
    if (!window.google?.payments?.api?.PaymentsClient) {
      toast({
        title: "Google Pay Not Available",
        description: "Please try another payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting Google Pay payment process...");
      
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // Use 'TEST' for development, 'PRODUCTION' for live
      });

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER', 'JCB']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: merchantId
            }
          }
        }],
        merchantInfo: {
          merchantId: merchantId,
          merchantName: 'Study Academy'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: price.toString(),
          currencyCode: 'INR',
          countryCode: 'IN'
        }
      };

      try {
        console.log('Initiating Google Pay payment with merchant ID:', merchantId);
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        console.log('Payment data received:', paymentData);
        
        // Send payment data to record the transaction
        const { data, error } = await supabase
          .from('user_purchases')
          .insert([{
            user_id: user.id,
            material_id: productId,
            payment_id: `google-pay-${Date.now()}`,
            amount: price,
            purchased_at: new Date().toISOString(),
            payment_method: 'GOOGLE_PAY',
            payment_status: 'COMPLETED'
          }]);
        
        if (error) {
          console.error("Database error recording payment:", error);
          throw new Error("Failed to record payment");
        }
        
        setIsLoading(false);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess();
      } catch (error: any) {
        console.error('Google Pay error:', error);
        
        // Handle user cancellation separately from other errors
        if (error.statusCode === "CANCELED") {
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process.",
            variant: "default",
          });
          onCancel();
        } else {
          toast({
            title: "Payment Failed",
            description: error.message || "There was an error processing your payment. Please try again.",
            variant: "destructive",
          });
          onCancel();
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing Google Pay payment:', error);
      setIsLoading(false);
      onCancel();
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={processPayment}
      disabled={isLoading || !googlePayAvailable}
      className="w-full bg-black hover:bg-gray-800 flex items-center justify-center gap-2 py-3"
    >
      {isLoading ? (
        "Processing..."
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM10 2C14.418 2 18 5.582 18 10C18 14.418 14.418 18 10 18C5.582 18 2 14.418 2 10C2 5.582 5.582 2 10 2Z" fill="white"/>
            <path d="M7 7V13H13V7H7Z" fill="white"/>
          </svg>
          <span>Pay with Google Pay</span>
        </>
      )}
    </Button>
  );
};

export default GooglePayButton;
