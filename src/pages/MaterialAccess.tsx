
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MaterialAccessProps {
  productId?: string;
}

const MaterialAccess = ({ productId: propProductId }: MaterialAccessProps) => {
  const params = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<any>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  
  const productId = propProductId || params.productId;
  const purchaseSuccess = location.state?.purchaseSuccess || false;
  const productName = location.state?.productName || 'study material';

  useEffect(() => {
    if (purchaseSuccess) {
      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${productName}`,
      });
    }

    if (productId) {
      fetchMaterialDetails(productId);
    } else {
      setLoading(false);
    }
  }, [productId, purchaseSuccess, productName, toast]);

  const fetchMaterialDetails = async (id: string) => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to access this content",
          variant: "destructive",
        });
        return;
      }

      // Check if the user has purchased this material
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('material_id', id)
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (purchaseError || !purchase) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this material or your access has expired",
          variant: "destructive",
        });
        return;
      }

      // Fetch material details
      const { data: materialData, error: materialError } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', id)
        .single();

      if (materialError || !materialData) {
        toast({
          title: "Error",
          description: "Failed to load material details",
          variant: "destructive",
        });
        return;
      }

      setMaterial(materialData);
      setAccessUrl(materialData.downloadurl);
    } catch (error) {
      console.error("Error fetching material access:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading material access...</p>
      </div>
    );
  }

  if (!material || !accessUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have access to this content or your access has expired.
              </p>
              <Button asChild>
                <Link to="/materials/premium">Browse Premium Materials</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Access Granted!</h2>
            <p className="text-gray-600 mb-6">
              You now have access to {material.title || material.name}
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <Button asChild size="lg">
                <a href={accessUrl} target="_blank" rel="noopener noreferrer" download>
                  Download Material
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/materials/my">
                  Back to My Materials
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialAccess;
