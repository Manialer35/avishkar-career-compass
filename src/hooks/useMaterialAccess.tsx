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
        setHasAccess(true);
        return;
      }

      // Check if user has purchased this material using Firebase UID
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.uid)
        .eq('material_id', materialId)
        .maybeSingle();

      if (purchaseError && purchaseError.code !== 'PGRST116') {
        throw purchaseError;
      }

      // Check if purchase exists and is not expired
      if (purchaseData) {
        const now = new Date();
        const expiresAt = purchaseData.expires_at ? new Date(purchaseData.expires_at) : null;
        
        if (!expiresAt || expiresAt > now) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          toast({
            title: "Access Expired",
            description: "Your access to this material has expired. Please purchase again.",
            variant: "destructive",
          });
        }
      } else {
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