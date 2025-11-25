import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const PaymentSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paymentId = searchParams.get('payment_id');
      const orderId = searchParams.get('order_id');
      const signature = searchParams.get('signature');
      const materialId = searchParams.get('material_id');

      if (!paymentId || !orderId || !signature || !materialId || !user) {
        toast({
          title: "Payment Error",
          description: "Invalid payment parameters",
          variant: "destructive",
        });
        navigate('/premium-materials');
        return;
      }

      try {
        // Get user ID consistently
        const userId = (user as any)?.uid || (user as any)?.id || user?.email;
        console.log('Verifying payment for user:', userId);
        
        // Verify payment and unlock material
        const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
          body: {
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
            productId: materialId,
            userId: userId,
          },
        });

        if (error) throw error;

        if (data.success) {
          // Edge function already recorded the purchase, just show success and redirect
          toast({
            title: "Payment Successful!",
            description: "Your study material has been unlocked",
          });

          // Redirect to the unlocked material
          navigate(`/material/${materialId}/access`, { 
            state: { purchaseSuccess: true } 
          });
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
        navigate('/premium-materials');
      }
    };

    handlePaymentSuccess();
  }, [searchParams, user, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">
            Please wait while we verify your payment and unlock your study material...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessHandler;