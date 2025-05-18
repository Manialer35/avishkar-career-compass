import { useLocation, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaterialDetail {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

const MaterialAccess = () => {
  const { productId } = useParams();
  const location = useLocation();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract purchase success information from navigation state
  const purchaseSuccess = location.state?.purchaseSuccess || false;
  const productName = location.state?.productName || '';
  
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!productId) {
        setError('Material ID is missing');
        setLoading(false);
        return;
      }

      try {
        // First check if the user has purchased this material
        const user = (await supabase.auth.getUser()).data.user;
        
        if (!user) {
          setError('You must be signed in to access this content');
          setLoading(false);
          return;
        }
        
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .limit(1);
          
        if (purchaseError) {
          throw purchaseError;
        }
        
        // If no purchase record exists and we didn't just complete a purchase
        if ((!purchaseData || purchaseData.length === 0) && !purchaseSuccess) {
          setError('You have not purchased this material');
          setLoading(false);
          return;
        }
        
        // Fetch the material details
        const { data, error } = await supabase
          .from('study_materials')
          .select('id, title, description, downloadurl, thumbnailurl')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setMaterial({
            id: data.id,
            title: data.title,
            description: data.description,
            downloadUrl: data.downloadurl,
            thumbnailUrl: data.thumbnailurl
          });
        } else {
          setError('Material not found');
        }
      } catch (err) {
        console.error('Error fetching material details:', err);
        setError('Error loading material details');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetails();
  }, [productId, purchaseSuccess]);

  if (loading) {
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading material details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/premium-materials">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Access Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-medium mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">
            {error === 'You have not purchased this material' 
              ? 'You need to purchase this material before accessing it.'
              : 'We encountered an issue while trying to load this material.'}
          </p>
          <Button asChild>
            <Link to="/premium-materials">Return to Premium Materials</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/premium-materials">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Material Not Found</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-yellow-600 text-lg font-medium mb-2">Material Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the material you're looking for.
          </p>
          <Button asChild>
            <Link to="/premium-materials">Return to Premium Materials</Link>
          </Button>
        </div>
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
      
      {purchaseSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          <p className="text-green-800">
            Thank you for your purchase of <strong>{productName || material.title}</strong>! You now have access to this premium material.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2 text-academy-primary">{material.title}</h2>
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
