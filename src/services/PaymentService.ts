// src/services/PaymentService.ts
import { supabase } from '@/integrations/supabase/client';

// Define the interface for payment request data
export interface PaymentRequestData {
  amount: number; // Amount in smallest currency unit (paise for INR)
  currency: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// Define the interface for RazorPay order response
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

// Define the interface for payment verification data
export interface PaymentVerificationData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  productId: string;
}

class PaymentService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  private razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  // Create a new Razorpay order
  async createOrder(paymentData: PaymentRequestData): Promise<RazorpayOrderResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Load Razorpay script
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Open Razorpay payment window
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

  // Verify payment after successful transaction
  async verifyPayment(paymentData: PaymentVerificationData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Record purchase in the database
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

  // Check if user has already purchased this material
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
