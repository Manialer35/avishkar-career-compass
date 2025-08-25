import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GooglePayButton from '@/components/GooglePayButton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PurchaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  duration_months?: number;
  duration_type?: string;
}

const ProductCheckout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PurchaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
          .select('id, title, name, description, price, thumbnailurl, duration_months, duration_type')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProduct({
            id: data.id,
            name: data.title || data.name,
            description: data.description || '',
            price: data.price || 0,
            imageSrc: data.thumbnailurl || `https://via.placeholder.com/350x200/1e3a8a/ffffff?text=${encodeURIComponent(data.title || data.name)}`,
            duration_months: data.duration_months,
            duration_type: data.duration_type
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

  const handlePaymentSuccess = async () => {
    try {
      // Record the purchase in the database
      if (user && product) {
        await supabase.from('user_purchases').insert({
          user_id: user.uid,
          material_id: product.id,
          amount: product.price,
          payment_id: `google-pay-${Date.now()}`, // In production, use actual payment ID
          expires_at: calculateExpiryDate(product.duration_months, product.duration_type)
        });
      }
      
      toast({
        title: "Purchase Successful",
        description: `You now have access to ${product?.name}`,
      });
      
      // Redirect to materials page instead of a non-existent access page
      navigate('/materials/my', { 
        state: { 
          purchaseSuccess: true,
          productName: product?.name 
        } 
      });
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast({
        title: "Error",
        description: "There was an error recording your purchase. Please contact support.",
        variant: "destructive",
      });
      
      // Still redirect to the materials page as payment was processed
      navigate('/materials/my');
    }
  };

  const calculateExpiryDate = (months?: number, type?: string): string => {
    if (type === 'lifetime') {
      // Far future date for lifetime access
      return new Date(2099, 11, 31).toISOString();
    }
    
    // Default to 3 months if not specified
    const durationMonths = months || 3;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    return expiryDate.toISOString();
  };

  const handleCancel = () => {
    navigate('/premium-materials');
  };

  const formatDuration = (months?: number, type?: string) => {
    if (type === 'lifetime') return 'Lifetime Access';
    if (!months || months === 0) return '3 Months Access (Default)';
    return months === 1 ? '1 Month Access' : `${months} Months Access`;
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
                  src={product?.imageSrc} 
                  alt={product?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg text-academy-primary">{product?.name}</h3>
                <p className="text-gray-600 mt-2">{product?.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-semibold">₹{product?.price?.toFixed(2)}</span>
                  <span className="text-sm text-academy-secondary font-medium">
                    {formatDuration(product?.duration_months, product?.duration_type)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Product</span>
                <span>{product?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price</span>
                <span>₹{product?.price?.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold">₹{product?.price?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              {product && (
                <GooglePayButton 
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              )}
              
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCheckout;
