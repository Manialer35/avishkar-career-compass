
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentService } from '@/services/PaymentService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GooglePayButton } from '@/components/PaymentComponents';

const PurchaseProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  useEffect(() => {
    checkCurrentUser();
    fetchProductDetails();
  }, [productId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user && productId) {
      const purchased = await paymentService.checkPurchase(user.id, productId);
      setAlreadyPurchased(purchased);
    }
  };

  const fetchProductDetails = async () => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive",
      });
      navigate('/premium-materials');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', productId)
        .eq('ispremium', true)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProduct(data);
      } else {
        toast({
          title: "Not Found",
          description: "The requested product could not be found",
          variant: "destructive",
        });
        navigate('/premium-materials');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
      navigate('/premium-materials');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Purchase Successful",
      description: "You can now access this material",
    });
    
    // Redirect to material page or download
    navigate(`/study-materials/${product.id}`);
  };

  const handlePaymentCancel = () => {
    toast({
      title: "Payment Cancelled",
      description: "You cancelled the payment process.",
      variant: "default",
    });
    setProcessingPayment(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          asChild
        >
          <Link to="/premium-materials">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Purchase Study Material</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img 
                src={product.thumbnailurl || `https://via.placeholder.com/350x200/1e3a8a/ffffff?text=${encodeURIComponent(product.title)}`} 
                alt={product.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-xl font-bold mb-2">{product.title}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium">Price:</span>
                  <span className="text-2xl font-bold">₹{product.price}</span>
                </div>

                {alreadyPurchased ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                    You have already purchased this material.
                    <Link to={`/study-materials/${product.id}`} className="block mt-2 text-blue-600 hover:underline">
                      View Material
                    </Link>
                  </div>
                ) : (
                  <GooglePayButton 
                    productId={product.id}
                    productName={product.title}
                    price={product.price}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseProduct;
