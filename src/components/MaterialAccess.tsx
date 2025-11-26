
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface MaterialAccessProps {
  productId?: string;
  purchaseSuccess?: boolean;
  productName?: string;
}

const MaterialAccess = ({ productId, purchaseSuccess = false, productName = '' }: MaterialAccessProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fromPayment = location.state?.fromPayment || false;
  
  useEffect(() => {
    if (productId) {
      fetchMaterialDetails();
    } else {
      setLoading(false);
    }
    
    if (purchaseSuccess) {
      console.log('Purchase successful, showing success toast');
      toast({
        title: "Purchase Successful!",
        description: `You now have access to "${productName}"`,
        duration: 5000,
      });
    }
    
    // If coming from payment, add extra delay to ensure DB is updated
    if (fromPayment) {
      console.log('Coming from payment, material should now be accessible');
    }
  }, [productId, purchaseSuccess, fromPayment]);
  
  const fetchMaterialDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (error) {
        throw error;
      }
      
      setMaterial(data);
    } catch (error: any) {
      console.error('Error fetching material details:', error);
      toast({
        title: "Error",
        description: "We couldn't load the material details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewMaterial = () => {
    console.log('[MaterialAccess] Opening material:', productId, 'isPremium:', material?.ispremium);
    
    if (material?.ispremium) {
      // Redirect to secure viewer for premium materials
      navigate(`/secure-material/${productId}`);
    } else {
      // For free materials, allow direct download
      if (!material?.downloadurl) {
        toast({
          title: "Download Error",
          description: "Download URL not available.",
          variant: "destructive",
        });
        return;
      }
      
      window.open(material.downloadurl, '_blank');
      
      // Record download
      if (productId) {
        supabase.rpc('increment_material_downloads', { material_id: productId })
          .then(({ data, error }) => {
            if (error) console.error('Error recording download:', error);
          });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading material access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-4" asChild>
          <Link to="/premium-materials">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Material Access</h1>
      </div>
      
      {purchaseSuccess ? (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="text-green-500 h-6 w-6" />
              <h2 className="text-xl font-semibold text-green-700">Purchase Successful!</h2>
            </div>
            <p className="text-green-700">
              Thank you for your purchase. You now have access to "{productName || material?.title}".
            </p>
          </CardContent>
        </Card>
      ) : null}
      
      {material ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">{material.title}</h2>
                <p className="text-gray-600 mb-6">{material.description}</p>
                
                <Button 
                  onClick={handleViewMaterial} 
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Eye size={18} />
                  {material.ispremium ? 'View Material Securely' : 'Download Material'}
                </Button>
                
                {material.ispremium && (
                  <p className="text-xs text-orange-600 mt-2">
                    Premium materials can only be viewed within the app for security.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Material Information</h3>
                
                {material.thumbnailurl && (
                  <div className="mb-4">
                    <img 
                      src={material.thumbnailurl} 
                      alt={material.title} 
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{material.ispremium ? 'Premium (Secure)' : 'Free'}</span>
                  </div>
                  {material.ispremium && (
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span>
                      <span>${material.price?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Downloads:</span>
                    <span>{material.download_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-red-600 text-lg font-medium mb-2">
            Material Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the material you're looking for.
          </p>
          <Button asChild>
            <Link to="/premium-materials">Browse Materials</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MaterialAccess;
