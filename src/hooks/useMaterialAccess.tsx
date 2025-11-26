import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMaterialAccess = (materialId: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [material, setMaterial] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (materialId && user) {
      checkAccess();
    } else {
      setLoading(false);
    }
  }, [materialId, user]);

  const checkAccess = async () => {
    try {
      setLoading(true);

      // Get consistent user ID - use uid first for Firebase compatibility
      const userId = (user as any)?.uid || (user as any)?.localId || user?.id || user?.email;
      console.log('[useMaterialAccess] Checking access for user:', userId, 'material:', materialId);

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
        console.log('Material is free, granting access');
        setHasAccess(true);
        return;
      }

      // Check if user has purchased this material
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .maybeSingle();

      if (purchaseError && purchaseError.code !== 'PGRST116') {
        throw purchaseError;
      }

      console.log('[useMaterialAccess] Purchase check result:', purchaseData);

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
      console.error('Error checking material access:', error);
      setHasAccess(false);
      toast({
        title: "Error",
        description: "Failed to verify access to this material.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    hasAccess,
    loading,
    material,
    checkAccess,
  };
};