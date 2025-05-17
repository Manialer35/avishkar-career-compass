import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, CreditCard, Smartphone } from 'lucide-react';

// Add declaration for Razorpay 
declare global {
  interface Window {
    Razorpay: any;
    google?: {
      payments?: {
        api?: {
          PaymentsClient?: any;
        }
      }
    };
  }
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  productName: string;
  onPaymentComplete?: () => void;
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  amount, 
  productName,
  onPaymentComplete,
  customerDetails = {}
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [googlePayLoaded, setGooglePayLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script on component mount
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        toast({
          title: "Payment Provider Error",
          description: "Could not load Razorpay. Please try again later.",
          variant: "destructive",
        });
      };
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, [toast]);

  // Load Google Pay script
  useEffect(() => {
    if (!document.getElementById('google-pay-script')) {
      const script = document.createElement('script');
      script.id = 'google-pay-script';
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => {
        console.log("Google Pay script loaded successfully");
        setGooglePayLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google Pay script");
        toast({
          title: "Payment Provider Error",
          description: "Could not load Google Pay. Please try again later.",
          variant: "destructive",
        });
      };
      document.body.appendChild(script);
    } else {
      setGooglePayLoaded(true);
    }
  }, [toast]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      if (selectedMethod === 'razorpay') {
        if (!razorpayLoaded) {
          throw new Error("Razorpay not loaded");
        }
        
        // Razorpay payment handling
        const options = {
          key: "rzp_test_ZGpRksLQDpujnN", // Replace with your Razorpay test key
          amount: amount * 100, // Amount in paise
          currency: "INR",
          name: "Avishkar Academy",
          description: productName,
          handler: function(response: any) {
            console.log("Payment successful:", response);
            if (response.razorpay_payment_id) {
              handlePaymentSuccess(response.razorpay_payment_id);
            }
          },
          prefill: {
            name: customerDetails.name || "",
            email: customerDetails.email || "",
            contact: customerDetails.phone || "",
          },
          notes: {
            product_name: productName,
          },
          theme: {
            color: "#1e3a8a",
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
        
        // We don't set processing to false here as Razorpay will handle the UI
      } else if (selectedMethod === 'phonepe') {
        // PhonePe payment implementation
        // Note: This is a placeholder for actual PhonePe integration
        // You'd typically redirect to PhonePe or use their SDK here
        
        // Simulate PhonePe payment for demo
        setTimeout(() => {
          const paymentId = `phonepe_${Date.now()}`;
          handlePaymentSuccess(paymentId);
        }, 2000);
      } else if (selectedMethod === 'googlepay') {
        if (!googlePayLoaded || !window.google?.payments?.api?.PaymentsClient) {
          throw new Error("Google Pay not loaded");
        }
        
        // Google Pay implementation
        const paymentClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST' // Use 'PRODUCTION' for live environment
        });
        
        const paymentDataRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['VISA', 'MASTERCARD']
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  gateway: 'example', // Replace with your payment gateway
                  gatewayMerchantId: 'exampleGatewayMerchantId' // Replace with your merchant ID
                }
              }
            }
          ],
          merchantInfo: {
            merchantId: '12345678901234567890', // Replace with your merchant ID
            merchantName: 'Avishkar Academy'
          },
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: amount.toString(),
            currencyCode: 'INR'
          }
        };
        
        paymentClient.loadPaymentData(paymentDataRequest)
          .then(paymentData => {
            // Process payment data
            console.log('Google Pay payment success:', paymentData);
            const paymentId = `googlepay_${Date.now()}`;
            handlePaymentSuccess(paymentId);
          })
          .catch(error => {
            console.error('Google Pay error:', error);
            setProcessing(false);
            toast({
              title: "Payment Failed",
              description: "Google Pay payment was not completed.",
              variant: "destructive",
            });
          });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setProcessing(false);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handlePaymentSuccess = (paymentId: string) => {
    setProcessing(false);
    toast({
      title: "Payment Successful!",
      description: `Your payment of ₹${amount} for ${productName} was successful.`,
    });
    
    if (onPaymentComplete) {
      onPaymentComplete();
    }
    
    // Save payment details if needed
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Payment</DialogTitle>
          <DialogDescription>
            Pay ₹{amount} for {productName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 my-4">
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'phonepe' 
              ? 'border-accent border-2' 
              : 'hover:border-accent'}`}
            onClick={() => setSelectedMethod('phonepe')}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Phone className="text-indigo-600 h-6 w-6" />
              </div>
              <span className="font-medium">PhonePe</span>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'googlepay' 
              ? 'border-accent border-2' 
              : 'hover:border-accent'}`}
            onClick={() => setSelectedMethod('googlepay')}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Smartphone className="text-green-600 h-6 w-6" />
              </div>
              <span className="font-medium">Google Pay</span>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'razorpay' 
              ? 'border-accent border-2' 
              : 'hover:border-accent'}`}
            onClick={() => setSelectedMethod('razorpay')}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <CreditCard className="text-blue-600 h-6 w-6" />
              </div>
              <span className="font-medium">Card / Net Banking</span>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose} className="btn-hover">
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!selectedMethod || processing}
            className="btn-hover bg-accent hover:bg-accent/90"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
