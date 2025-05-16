import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Lock, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the product interface for the ProductGrid component
export interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

interface ProductPurchaseProps {
  product: ProductType;
  onPurchaseComplete?: () => void;
}

// Individual product card component
const ProductCard = ({ product, onPurchaseComplete }: ProductPurchaseProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [accessExpired, setAccessExpired] = useState(false);

  useEffect(() => {
    checkPurchaseStatus();
  }, [product.id]);

  const checkPurchaseStatus = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Check purchase status
      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('material_id', product.id)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking purchase status:', error);
        return;
      }

      if (purchase) {
        setAlreadyPurchased(true);
        
        // Check if access has expired
        const expiryDate = new Date(purchase.expires_at);
        const now = new Date();
        
        if (now > expiryDate) {
          setAccessExpired(true);
        }
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to purchase this material');
        navigate('/login');
        return;
      }

      // In a real application, this is where you'd integrate with a payment processor
      // For this example, we'll simulate a successful purchase
      
      // Create purchase record with expiration date (3 months from now)
      const purchaseDate = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3); // Add 3 months
      
      const { data, error } = await supabase
        .from('purchases')
        .insert([
          {
            material_id: product.id,
            user_id: user.id,
            purchase_date: purchaseDate.toISOString(),
            expires_at: expiresAt.toISOString(),
            amount: product.price
          }
        ]);

      if (error) {
        throw error;
      }

      // Notify parent component of successful purchase
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }

      // Navigate to view the material
      navigate(`/materials/view/${product.id}`);
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('There was an error processing your purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    navigate(`/materials/view/${product.id}`);
  };

  const handleRenew = () => {
    // For simplicity, just reuse the purchase flow
    handlePurchase();
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full relative overflow-hidden bg-gray-100">
        <img 
          src={product.imageSrc} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            ${product.price.toFixed(2)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 mt-auto">
        {alreadyPurchased ? (
          accessExpired ? (
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleRenew}
              disabled={loading}
            >
              <Lock className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Renew Access'}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleView}
              variant="default"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Material
            </Button>
          )
        ) : (
          <Button 
            className="w-full" 
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Purchase'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Grid component to display multiple products
export const ProductGrid = ({ products }: { products: ProductType[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
