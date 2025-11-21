
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GooglePayButton, PaymentSummary } from './PaymentComponents';

interface PurchaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

const ProductCheckout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PurchaseProduct | null>(null);
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
          .select('id, title, description, price, thumbnailurl')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProduct({
            id: data.id,
            name: data.title,
            description: data.description,
            price: data.price || 0,
            imageSrc: data.thumbnailurl || `https://via.placeholder.com/350x200/1e3a8a/ffffff?text=${encodeURIComponent(data.title)}`
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

  const handlePaymentSuccess = () => {
    // Redirect to success page or material access page
    navigate(`/material/${productId}/access`, { 
      state: { 
        purchaseSuccess: true,
        productName: product?.name 
      } 
    });
  };

  const handleCancel = () => {
    navigate('/premium-materials');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/premium-materials">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Checkout</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading checkout details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" asChild>
            <Link to="/premium-materials">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-academy-primary">Checkout Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-medium mb-2">
            {error || 'Product not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't load the checkout information for this product.
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
        <h1 className="text-2xl font-bold text-academy-primary">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Information */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 w-full md:w-40 h-40 overflow-hidden rounded-md">
                <img 
                  src={product.imageSrc} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg text-academy-primary">{product.name}</h3>
                <p className="text-gray-600 mt-2">{product.description}</p>
                <div className="mt-4">
                  <span className="text-xl font-semibold">₹{product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <PaymentSummary productName={product.name} price={product.price} />
            
            <div className="mt-6">
              <GooglePayButton 
                productId={product.id}
                productName={product.name}
                price={product.price}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCheckout;
