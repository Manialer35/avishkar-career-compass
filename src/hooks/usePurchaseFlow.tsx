import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
      // Get Supabase auth token
      const authToken = await getSupabaseToken();
      
      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: price,
          currency: 'INR',
          productId: materialId,
          productName: materialTitle,
          customerId: (user as any)?.uid || '',
          customerEmail: user?.email || '',
          customerPhone: (user as any)?.phoneNumber || '',
        },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (orderError) throw orderError;

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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_OCL24jX6vVdT6W',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Study Academy',
        description: `Payment for ${materialTitle}`,
        order_id: orderData.id,
        prefill: {
          name: user?.displayName || user?.email?.split('@')[0] || '',
          email: user?.email || '',
          contact: (user as any)?.phoneNumber || (user as any)?.phone || '',
        },
        handler: (response: any) => {
          // Redirect to success page with payment details
          const successUrl = new URL('/payment-success', window.location.origin);
          successUrl.searchParams.set('payment_id', response.razorpay_payment_id);
          successUrl.searchParams.set('order_id', response.razorpay_order_id);
          successUrl.searchParams.set('signature', response.razorpay_signature);
          successUrl.searchParams.set('material_id', materialId);
          
          window.location.href = successUrl.toString();
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

      return orderData;
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
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', (user as any)?.id || (user as any)?.uid || '')
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