
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // Load Google Pay API script
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => checkGooglePayAvailability();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkGooglePayAvailability = async () => {
    if (!window.google?.payments?.api?.PaymentsClient) {
      console.error('Google Pay API not available');
      return;
    }

    try {
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
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          }
        }]
      };

      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
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

    try {
      setIsLoading(true);
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
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'Study Academy'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: price.toString(),
          currencyCode: 'USD',
          countryCode: 'US'
        }
      };

      // For demonstration purposes, we're simulating a successful payment
      // In a real implementation, you would process the payment token with your backend
      setTimeout(() => {
        setIsLoading(false);
        // Call the success callback
        onSuccess();
      }, 2000);
      
      // In a real implementation, you would use:
      // const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      // Process paymentData with your backend
      // onSuccess();

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

  // For demo purposes, we'll simulate Google Pay availability
  // In a real implementation, use the actual availability state
  const isAvailable = true; // Use googlePayAvailable in a real implementation

  return (
    <Button 
      onClick={processPayment}
      disabled={isLoading || !isAvailable}
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
