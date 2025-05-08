
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
import { Phone, CreditCard } from 'lucide-react';

// Add declaration for Razorpay 
declare global {
  interface Window {
    Razorpay: any;
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

const PaymentModal: React.FC<PaymentModalProps> = ({ 
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
          description: "Could not load payment provider. Please try again later.",
          variant: "destructive",
        });
      };
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
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
          throw new Error("Payment provider not loaded");
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
        // Simulate PhonePe payment for demo
        setTimeout(() => {
          const paymentId = `phonepay_${Date.now()}`;
          handlePaymentSuccess(paymentId);
        }, 2000);
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
        
        <div className="grid grid-cols-2 gap-4 my-4">
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
              <span className="font-medium">PhonePe / UPI</span>
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
              <span className="font-medium">Card / Netbanking</span>
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
