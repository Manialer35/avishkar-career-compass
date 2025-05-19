
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaterialDetail {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

interface MaterialAccessProps {
  productId?: string;
  purchaseSuccess?: boolean;
  productName?: string;
}

const MaterialAccess: React.FC<MaterialAccessProps> = ({ 
  productId: propProductId,
  purchaseSuccess: propPurchaseSuccess,
  productName: propProductName
}) => {
  const { productId: paramProductId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  
  // Use props or URL params/state
  const productId = propProductId || paramProductId;
  const purchaseSuccess = propPurchaseSuccess || location.state?.purchaseSuccess || false;
  const productName = propProductName || location.state?.productName || 'study material';

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
  }, [productId, purchaseSuccess, productName]);

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
        setError("Authentication required");
        setLoading(false);
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
        setError("Access denied");
        setLoading(false);
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
        setError("Failed to load material details");
        setLoading(false);
        return;
      }

      setMaterial({
        id: materialData.id,
        title: materialData.title || materialData.name,
        description: materialData.description || '',
        downloadUrl: materialData.downloadurl || '',
        thumbnailUrl: materialData.thumbnailurl
      });
      setAccessUrl(materialData.downloadurl);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching material access:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setError("An unexpected error occurred");
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
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/materials/premium">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Access Denied</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-medium mb-2">{error || "Access Denied"}</h2>
          <p className="text-gray-600 mb-4">
            You don't have access to this content or your access has expired.
          </p>
          <Button asChild>
            <Link to="/materials/premium">Browse Premium Materials</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-4" asChild>
          <Link to="/materials/premium">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Material Access</h1>
      </div>
      
      {purchaseSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          <p className="text-green-800">
            Thank you for your purchase of <strong>{productName}</strong>! You now have access to this premium material.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
          <p className="text-gray-600 mb-6">{material.description}</p>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium mb-4">Download Material</h3>
            <Button
              asChild
              className="flex items-center"
            >
              <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="mr-2 h-4 w-4" />
                Download Material
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialAccess;
