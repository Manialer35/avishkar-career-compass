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
      const rzp = await loadRazorpay();
      setRazorpay(rzp);
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
      // 1. Create Order on Server
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // amount in paise
          currency,
          productId,
          productName,
          customerId: user.id,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Razorpay key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Academind Premium',
        description: productName,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment on the server
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              productId: productId,
            }),
          });

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json();
            throw new Error(errorData.message || 'Payment verification failed');
          }

          toast({
            title: "Payment Successful!",
            description: "Your payment was processed successfully.",
          });

          // Redirect to success page
          navigate(`/payment-success/${productId}`);
        },
        prefill: {
          name: user?.user_metadata?.full_name || 'John Doe',
          email: user?.email || 'john.doe@example.com',
          contact: '',
        },
        notes: {
          productId,
          productName,
          userId: user.id,
        },
        theme: {
          color: '#6366f1',
        },
      };

      // 3. Open Razorpay checkout
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
      Pay {amount} {currency}
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

  const downloadMaterial = async (materialId) => {
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

export default PaymentButton;
