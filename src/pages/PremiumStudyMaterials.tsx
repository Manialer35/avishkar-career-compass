
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the interface for a product
interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  duration_months?: number;
  duration_type?: string;
}

// Product Card component
const ProductCard = ({ product }: { product: ProductType }) => {
  const formatDuration = (months?: number, type?: string) => {
    if (type === 'lifetime') return 'Lifetime Access';
    if (!months) return '';
    return months === 1 ? '1 Month Access' : `${months} Months Access`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.imageSrc} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 text-academy-primary">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-academy-secondary">${product.price.toFixed(2)}</span>
          <span className="text-sm text-academy-secondary font-medium">
            {formatDuration(product.duration_months, product.duration_type)}
          </span>
        </div>
        <Button 
          className="w-full mt-3 bg-academy-primary hover:bg-academy-secondary"
          asChild
        >
          <Link to={`/purchase/${product.id}`}>Purchase</Link>
        </Button>
      </div>
    </div>
  );
};

// Product Grid component
const ProductGrid = ({ products }: { products: ProductType[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const PremiumStudyMaterials = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumMaterials();
  }, []);

  const fetchPremiumMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('ispremium', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const products: ProductType[] = data.map(item => ({
          id: item.id,
          name: item.title || item.name,
          description: item.description || '',
          price: item.price || 0,
          imageSrc: item.thumbnailurl || "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=" + encodeURIComponent(item.title || item.name),
          duration_months: item.duration_months,
          duration_type: item.duration_type
        }));
        setProducts(products);
      }
    } catch (error) {
      console.error('Error fetching premium materials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Premium Study Materials</h1>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading premium materials...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">No premium study materials found</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

export default PremiumStudyMaterials;
