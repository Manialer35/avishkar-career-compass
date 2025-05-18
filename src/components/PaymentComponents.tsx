import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentProps {
  productId: string;
  productName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const GooglePayButton = ({ productId, productName, price, onSuccess, onCancel }: PaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setPaymentStatus('processing');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record the purchase in Supabase
      const { error } = await supabase
        .from('purchases')
        .insert({
          product_id: productId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount: price,
          payment_method: 'google_pay',
          status: 'completed'
        });
        
      if (error) {
        throw new Error(error.message);
      }
      
      setPaymentStatus('success');
      
      // Wait a moment to show the success state before redirecting
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {paymentStatus === 'idle' && (
        <Button 
          onClick={handlePayment}
          className="bg-white text-black hover:bg-gray-100 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center w-full max-w-xs"
        >
          <img 
            src="/google-pay-logo.svg" 
            alt="Google Pay" 
            className="h-6 mr-2"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = 'none';
            }}
          />
          Pay with Google Pay
        </Button>
      )}
      
      {paymentStatus === 'processing' && (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-academy-primary" />
          <p className="text-sm text-gray-600">Processing payment...</p>
        </div>
      )}
      
      {paymentStatus === 'success' && (
        <div className="text-center">
          <div className="bg-green-100 p-2 rounded-full inline-flex mb-2">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Payment successful!</p>
        </div>
      )}
      
      {paymentStatus === 'error' && (
        <div className="text-center">
          <div className="bg-red-100 p-2 rounded-full inline-flex mb-2">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600">{errorMessage || 'Payment failed'}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setPaymentStatus('idle')}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {paymentStatus === 'idle' && (
        <Button 
          variant="ghost" 
          className="mt-4 text-sm" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export const PaymentSummary = ({ productName, price }: { productName: string, price: number }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="font-medium text-lg mb-2">Order Summary</h3>
      <div className="flex justify-between py-2 border-b border-gray-200">
        <span>{productName}</span>
        <span>${price.toFixed(2)}</span>
      </div>
      <div className="flex justify-between py-2 font-medium mt-2">
        <span>Total</span>
        <span>${price.toFixed(2)}</span>
      </div>
    </div>
  );
};
