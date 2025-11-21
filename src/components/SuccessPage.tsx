import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

const SuccessPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('study_materials')
          .select('id, title, description, downloadurl, thumbnailurl, price, ispremium')
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
            thumbnailUrl: data.thumbnailurl,
            isPremium: data.ispremium,
            price: data.price
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAccessMaterial = () => {
    navigate(`/material/${productId}/access`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Payment Successful</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading details...</div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="bg-red-100 p-2 rounded-full inline-flex mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-red-600 text-lg font-medium mb-2">
            {error || 'Could not load product details'}
          </h2>
          <p className="text-gray-600 mb-4">
            We encountered an issue while trying to load this product.
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
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Payment Successful</h1>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-academy-primary">Thank You For Your Purchase!</h2>
          <p className="text-gray-600 mb-6">
            Your payment for <span className="font-medium">{material.title}</span> was successful.
          </p>
          
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{material.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">${material.price?.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="mb-6 text-gray-600">
            You can now access your premium content. Click the button below to view your material.
          </p>
          
          <Button onClick={handleAccessMaterial} className="w-full max-w-xs">
            Access My Material
          </Button>
          
          <p className="text-xs text-gray-400 mt-8">
            A receipt has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
