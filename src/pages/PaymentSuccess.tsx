import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, getSupabaseToken } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentVerification = async () => {
      if (!user) {
        setError('User not authenticated');
        setProcessing(false);
        return;
      }

      const paymentId = searchParams.get('payment_id');
      const orderId = searchParams.get('order_id');
      const signature = searchParams.get('signature');
      const materialId = searchParams.get('material_id');

      if (!paymentId || !orderId || !signature || !materialId) {
        setError('Missing payment details');
        setProcessing(false);
        return;
      }

      try {
        // Get authentication token
        const token = await getSupabaseToken();
        if (!token) {
          throw new Error('Authentication token not available');
        }

        // Verify payment
        const { data, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
            productId: materialId,
            userId: user.uid
          }
        });

        if (verifyError) {
          throw new Error(verifyError.message || 'Payment verification failed');
        }

        if (data?.success) {
          setSuccess(true);
          toast({
            title: "Payment Successful!",
            description: "You now have access to the study material",
          });
        } else {
          throw new Error(data?.error || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setError(error.message || 'Payment verification failed');
        toast({
          title: "Payment Verification Failed",
          description: error.message || "Please contact support",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentVerification();
  }, [user, searchParams, getSupabaseToken, toast]);

  const handleAccessMaterial = () => {
    const materialId = searchParams.get('material_id');
    if (materialId) {
      navigate(`/material/${materialId}/access`);
    } else {
      navigate('/study-materials');
    }
  };

  const handleRetryPayment = () => {
    const materialId = searchParams.get('material_id');
    if (materialId) {
      navigate(`/purchase/${materialId}`);
    } else {
      navigate('/study-materials');
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <LoadingSpinner text="Verifying payment..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          {success ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-700 mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your payment has been verified and you now have access to the study material.
              </p>
              <Button onClick={handleAccessMaterial} className="w-full">
                Access My Material
              </Button>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-700 mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {error || 'We could not verify your payment. Please contact support or try again.'}
              </p>
              <div className="space-y-2">
                <Button onClick={handleRetryPayment} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Go Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;