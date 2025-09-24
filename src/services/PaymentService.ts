
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRequestData {
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
}

export interface PaymentVerificationData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  productId: string;
}

class PaymentService {
  // PRODUCTION FIX: Use live Razorpay key for production
  private razorpayKeyId = 'rzp_live_R8LCnQPRlQpF0s';

  async createOrder(paymentData: PaymentRequestData, authToken?: string): Promise<RazorpayOrderResponse> {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: paymentData,
        headers,
      });

      if (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async openRazorpayCheckout(
    orderData: RazorpayOrderResponse,
    productName: string,
    customerData: { name?: string; email?: string; phone?: string },
    onSuccess: (paymentData: PaymentVerificationData) => void,
    onFailure: (error: any) => void
  ) {
    const options = {
      key: this.razorpayKeyId,
      amount: orderData.amount.toString(),
      currency: orderData.currency,
      name: 'Study Academy',
      description: `Payment for ${productName}`,
      order_id: orderData.id,
      prefill: {
        name: customerData.name || '',
        email: customerData.email || '',
        contact: customerData.phone || '',
      },
      handler: (response: any) => {
        const verificationData: PaymentVerificationData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          productId: productName,
        };
        onSuccess(verificationData);
      },
      modal: {
        ondismiss: () => {
          onFailure('Payment cancelled by user');
        },
      },
      theme: {
        color: '#1e3a8a',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  async verifyPayment(paymentData: PaymentVerificationData, authToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: paymentData,
        headers,
      });

      if (error) {
        console.error('Error verifying payment:', error);
        throw new Error('Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async recordPurchase(
    userId: string, 
    materialId: string, 
    paymentId: string, 
    amount: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          material_id: materialId,
          payment_id: paymentId,
          amount: amount,
          purchased_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw error;
    }
  }

  async checkPurchase(userId: string, materialId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId);

      if (error) throw error;

      return !!data && data.length > 0;
    } catch (error) {
      console.error('Error checking purchase:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
