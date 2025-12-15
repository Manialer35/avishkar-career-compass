import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getAuthUserId } from '@/utils/getAuthUserId';

const PaymentSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, getSupabaseToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Wait until auth is resolved; payment success page often loads from a cold start.
      if (authLoading) return;

      const paymentId = searchParams.get('payment_id');
      const orderId = searchParams.get('order_id');
      const signature = searchParams.get('signature');
      const materialId = searchParams.get('material_id');

      if (!paymentId || !orderId || !signature || !materialId) {
        toast({
          title: 'Payment Error',
          description: 'Invalid payment parameters',
          variant: 'destructive',
        });
        navigate('/premium-materials', { replace: true });
        return;
      }

      if (!user) {
        // Force Google sign-in first, then return here to complete verification.
        navigate('/auth', {
          replace: true,
          state: { returnTo: `${location.pathname}${location.search}` },
        });
        return;
      }

      try {
        const userId = getAuthUserId(user);
        if (!userId) throw new Error('User ID not available');

        const token = await getSupabaseToken();

        console.log('[PaymentSuccessHandler] Verifying payment for user:', userId, 'material:', materialId);

        const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: {
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
            productId: materialId,
            userId,
          },
        });

        console.log('[PaymentSuccessHandler] Payment verification response:', { data, error });

        if (error) throw error;

        if (data?.success) {
          toast({
            title: 'Payment Successful!',
            description: 'Your study material has been unlocked',
          });

          // Navigation immediately after verification can race with route guards; keep it simple and deterministic.
          navigate(`/material/${materialId}/access`, {
            state: { purchaseSuccess: true, fromPayment: true },
            replace: true,
          });
        } else {
          throw new Error(data?.error || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: 'Payment Verification Failed',
          description: error?.message || 'Please contact support',
          variant: 'destructive',
        });
        navigate('/premium-materials', { replace: true });
      }
    };

    handlePaymentSuccess();
  }, [searchParams, user, authLoading, getSupabaseToken, navigate, toast, location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment and unlock your study material...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessHandler;