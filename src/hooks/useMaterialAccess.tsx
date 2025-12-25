import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAuthUserId } from '@/utils/getAuthUserId';
import { useLocation } from 'react-router-dom';

export const useMaterialAccess = (materialId: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [material, setMaterial] = useState<any>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Check if we're coming from a successful payment
  const fromPayment = location.state?.fromPayment || location.state?.purchaseSuccess;

  const checkAccess = useCallback(async () => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('[useMaterialAccess] Waiting for auth...');
      return;
    }

    if (!materialId) {
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('[useMaterialAccess] No user, denying access');
      setLoading(false);
      setHasAccess(false);
      return;
    }

    try {
      setLoading(true);

      // Get consistent user ID (Firebase-compatible)
      const userId = getAuthUserId(user);
      console.log('[useMaterialAccess] Checking access for user:', userId, 'material:', materialId);

      if (!userId) {
        console.error('[useMaterialAccess] Could not extract user ID from user object:', user);
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Get material details
      const { data: materialData, error: materialError } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (materialError) {
        throw materialError;
      }

      setMaterial(materialData);

      // If material is not premium, allow access
      if (!materialData.ispremium) {
        console.log('[useMaterialAccess] Material is free, granting access');
        setHasAccess(true);
        return;
      }

      // Check if user has purchased this material
      console.log('[useMaterialAccess] Querying purchases for user:', userId, 'material:', materialId);
      
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .maybeSingle();

      if (purchaseError && purchaseError.code !== 'PGRST116') {
        console.error('[useMaterialAccess] Purchase query error:', purchaseError);
        throw purchaseError;
      }

      console.log('[useMaterialAccess] Purchase query result:', purchaseData);

      // Check if purchase exists and is not expired
      if (purchaseData) {
        const now = new Date();
        const expiresAt = purchaseData.expires_at ? new Date(purchaseData.expires_at) : null;
        
        if (!expiresAt || expiresAt > now) {
          console.log('[useMaterialAccess] Access granted - valid purchase found');
          setHasAccess(true);
        } else {
          console.log('[useMaterialAccess] Access denied - purchase expired');
          setHasAccess(false);
          toast({
            title: "Access Expired",
            description: "Your access to this material has expired. Please purchase again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('[useMaterialAccess] Access denied - no purchase found for user:', userId);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('[useMaterialAccess] Error checking material access:', error);
      setHasAccess(false);
      toast({
        title: "Error",
        description: "Failed to verify access to this material.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [materialId, user, authLoading, toast]);

  // Run check when dependencies change or when coming from payment
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Re-check access after a short delay if coming from payment (handles race conditions)
  useEffect(() => {
    if (fromPayment && user && !authLoading) {
      const timer = setTimeout(() => {
        console.log('[useMaterialAccess] Re-checking access after payment redirect');
        checkAccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fromPayment, user, authLoading, checkAccess]);

  return {
    hasAccess,
    loading: loading || authLoading,
    material,
    checkAccess,
  };
};