import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseFlowOptions {
  materialId: string;
  materialTitle: string;
  price: number;
}

export const usePurchaseFlow = () => {
  const [loading, setLoading] = useState(false);
  const { user, getSupabaseToken } = useAuth();
  const { toast } = useToast();

  const initiatePurchase = async ({ materialId, materialTitle, price }: PurchaseFlowOptions) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase study materials",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      // Get authentication token
      const token = await getSupabaseToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      console.log('Initiating purchase for material:', materialId, 'Price:', price);

      // Call the edge function to create Razorpay order
      const userId = user.uid || user.localId || user.email;
      console.log('Creating order for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          amount: price * 100, // Convert to paise
          currency: 'INR',
          productId: materialId,
          productName: materialTitle,
          customerId: userId,
          customerEmail: user.email || ''
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (!data) {
        throw new Error('No order data received from server');
      }

      console.log('Razorpay order created:', data.id);

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Create Razorpay options
      const options = {
        key: 'rzp_live_R8LCnQPRlQpF0s', // Razorpay live key (must match server RAZORPAY_KEY_ID)
        amount: data.amount,
        currency: data.currency,
        name: 'Aavishkar Career Academy',
        description: `Payment for ${materialTitle}`,
        order_id: data.id,
        prefill: {
          name: user?.name || user?.email?.split('@')[0] || '',
          email: user?.email || '',
          contact: '',
        },
        handler: async function (response: any) {
          try {
            // Get authentication token for verification
            const token = await getSupabaseToken();
            
            // Get user ID consistently
            const userId = user.uid || user.localId || user.email;
            console.log('Verifying payment for user:', userId);
            
            // Verify payment
            const verifyResult = await supabase.functions.invoke('verify-razorpay-payment', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                productId: materialId,
                userId: userId
              }
            });

            if (verifyResult.error) {
              throw new Error(verifyResult.error.message || 'Payment verification failed');
            }

            if (verifyResult.data?.success) {
              toast({
                title: "Payment Successful!",
                description: "You now have access to the study material",
              });
              
              // Redirect to secure material viewer page
              window.location.href = `/secure-material/${materialId}`;
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime",
            });
          },
        },
        theme: {
          color: '#1e3a8a',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      return data;
    } catch (error: any) {
      console.error('Purchase initiation error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to initiate purchase",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async (materialId: string) => {
    if (!user) return false;

    try {
      const userId = user.uid || user.localId || user.email;
      
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }
  };

  return {
    loading,
    initiatePurchase,
    checkPurchaseStatus,
  };
};

export default usePurchaseFlow;