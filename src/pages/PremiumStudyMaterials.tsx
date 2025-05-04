
import { Product, ProductGrid } from '@/components/ProductPurchase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PremiumStudyMaterials = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
        const products: Product[] = data.map(item => ({
          id: item.id,
          name: item.title,
          description: item.description,
          price: item.price || 0,
          imageSrc: item.thumbnailurl || "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=" + encodeURIComponent(item.title)
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
