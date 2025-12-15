import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAuthUserId } from '@/utils/getAuthUserId';

interface PaymentSuccessHandlerProps {
  paymentId: string;
  productId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PaymentSuccessHandler: React.FC<PaymentSuccessHandlerProps> = ({
  paymentId,
  productId,
  amount,
  onSuccess,
  onError,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (paymentId && productId && user) {
      handlePaymentSuccess();
    }
  }, [paymentId, productId, user]);

  const handlePaymentSuccess = async () => {
    try {
      // Get material details for expiry calculation
      const { data: material, error: materialError } = await supabase
        .from('study_materials')
        .select('duration_months, duration_type')
        .eq('id', productId)
        .single();

      if (materialError) {
        throw materialError;
      }

      // Calculate expiry date
      let expiryDate: string | null = null;
      if (material.duration_type === 'lifetime') {
        expiryDate = null; // No expiry for lifetime access
      } else {
        const now = new Date();
        const expiry = new Date(now);
        expiry.setMonth(expiry.getMonth() + (material.duration_months || 12));
        expiryDate = expiry.toISOString();
      }

      const userId = getAuthUserId(user);
      if (!userId) {
        throw new Error('User ID not available');
      }

      // Record the purchase in user_purchases table (idempotent)
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .upsert(
          {
            user_id: userId,
            material_id: productId,
            payment_id: paymentId,
            amount: amount,
            expires_at: expiryDate,
            purchased_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,material_id', ignoreDuplicates: false }
        );

      if (purchaseError) {
        throw purchaseError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error recording purchase:', error);
      onError(error instanceof Error ? error.message : 'Failed to record purchase');
    }
  };

  return null; // This component doesn't render anything
};