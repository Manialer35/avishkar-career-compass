
import React, { useState, useEffect } from 'react';
import { loadRazorpay } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  productId: string;
  productName: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, currency = 'INR', productId, productName }) => {
  const [razorpay, setRazorpay] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        const rzp = await loadRazorpay();
        console.log("Razorpay loaded successfully:", rzp ? "available" : "not available");
        setRazorpay(rzp);
      } catch (err) {
        console.error("Error loading Razorpay:", err);
      }
    };

    initializeRazorpay();
  }, []);

  const handlePayment = async () => {
    if (!razorpay) {
      toast({
        title: "Payment Error",
        description: "Razorpay SDK failed to load. Please try again.",
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
      console.log("Starting payment process for:", productName, "with amount:", amount);
      // Mock server-side order creation since we don't have a real backend
      // In production, you should call your backend API to create an order
      const orderData = {
        id: "order_" + Date.now().toString(),
        amount: amount * 100, // amount in paise
        currency: currency,
        receipt: "receipt_" + Math.random().toString(36).substring(2, 15)
      };
      
      console.log("Order created:", orderData);

      // 2. Configure Razorpay options
      const options = {
        key: "rzp_test_YOUR_TEST_KEY", // Replace with your Razorpay test key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Academind Premium',
        description: productName,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Normally, you would verify the payment on your backend
          console.log("Payment successful:", response);
          try {
            // Record the purchase in your database
            const { error } = await supabase.from('user_purchases').insert({
              user_id: user.id,
              material_id: productId,
              amount: amount,
              payment_id: response.razorpay_payment_id,
              // Set expiry date to 1 year from now for demo
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
            
            if (error) throw error;
            
            toast({
              title: "Payment Successful!",
              description: "Your payment was processed successfully.",
            });

            // Redirect to success page
            navigate(`/materials/my`);
          } catch (error) {
            console.error("Error recording purchase:", error);
            toast({
              title: "Error",
              description: "Payment was processed but we couldn't record your purchase. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        notes: {
          productId,
          productName,
          userId: user.id,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "default",
            });
          }
        }
      };

      // 3. Open Razorpay checkout
      try {
        console.log("Opening Razorpay checkout with options:", JSON.stringify(options));
        const paymentObject = new razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error);
          toast({
            title: "Payment Failed",
            description: response.error.description || "Your payment failed. Please try again.",
            variant: "destructive",
          });
        });
      } catch (error) {
        console.error("Error opening Razorpay:", error);
        toast({
          title: "Payment Error",
          description: "Could not open payment form. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handlePayment}>
      Pay ₹{amount} {currency}
    </Button>
  );
};

interface DownloadButtonProps {
  materialId: string;
  downloadUrl: string;
  onDownloadComplete?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ materialId, downloadUrl, onDownloadComplete }) => {
  const { toast } = useToast();

  const downloadMaterial = async (materialId: string) => {
    try {
      // Call the RPC function to increment the download count
      const { data, error } = await supabase.rpc('increment_material_downloads', { 
        material_id: materialId 
      });
      
      if (error) {
        console.error('Error incrementing download count:', error);
      } else {
        console.log('New download count:', data);
      }
      
      // Create a temporary link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'filename.pdf'); // or any other extension
      document.body.appendChild(link);
  
      // Programmatically click the link to trigger the download
      link.click();
  
      // Clean up the temporary link
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your download will begin shortly.",
      });

      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Download Error",
        description: "Failed to initiate the download. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={() => downloadMaterial(materialId)}>
      Download Now
    </Button>
  );
};

// Add these components for ProductCheckout.tsx
export const GooglePayButton: React.FC<{
  productId: string;
  productName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ productId, productName, price, onSuccess, onCancel }) => {
  // This is a placeholder component for Google Pay integration
  return (
    <Button 
      onClick={onSuccess}
      className="w-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2 py-3"
    >
      <img src="/google-pay-logo.svg" alt="Google Pay" className="h-5 w-auto" />
      <span>Pay with Google Pay</span>
    </Button>
  );
};

export const PaymentSummary: React.FC<{
  productName: string;
  price: number;
}> = ({ productName, price }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Product</span>
        <span>{productName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Price</span>
        <span>₹{price.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
        <span className="font-medium">Total</span>
        <span className="font-semibold">₹{price.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentButton;
