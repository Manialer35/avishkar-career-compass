
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFolders } from '@/hooks/useFolders';

// Define the interface for a product
interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  duration_months?: number;
  duration_type?: string;
  folder_id?: string;
}

// Icon mapping for different material types
const getIconForMaterial = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('math') || titleLower.includes('गणित')) return Calculator;
  if (titleLower.includes('current affairs') || titleLower.includes('समसामयिक')) return FileText;
  if (titleLower.includes('exam') || titleLower.includes('परीक्षा')) return BookOpen;
  if (titleLower.includes('age') || titleLower.includes('वय')) return Calendar;
  if (titleLower.includes('geography') || titleLower.includes('भूगोल')) return MapPin;
  if (titleLower.includes('history') || titleLower.includes('इतिहास')) return Building;
  if (titleLower.includes('group') || titleLower.includes('समूह')) return Users;
  if (titleLower.includes('education') || titleLower.includes('शिक्षण')) return GraduationCap;
  return Book; // Default icon
};

// Product Card component
const ProductCard = ({ product }: { product: ProductType }) => {
  const IconComponent = getIconForMaterial(product.name);
  
  const formatDuration = (months?: number, type?: string) => {
    if (type === 'lifetime') return 'Lifetime Access';
    if (!months) return '';
    return months === 1 ? '1 Month Access' : `${months} Months Access`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-academy-red transition-all hover:shadow-lg">
      <div className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-lg bg-academy-red/10">
            <IconComponent size={32} className="text-academy-red" />
          </div>
          <h3 className="text-lg font-semibold text-academy-primary line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
          )}
          <div className="flex justify-between items-center w-full">
            <span className="text-lg font-bold text-academy-red">₹{product.price.toFixed(2)}</span>
            {(product.duration_months || product.duration_type) && (
              <span className="text-sm text-academy-secondary font-medium">
                {formatDuration(product.duration_months, product.duration_type)}
              </span>
            )}
          </div>
          <Button 
            className="w-full bg-academy-red hover:bg-academy-red/90 text-white"
            asChild
          >
            <Link to={`/purchase/${product.id}`}>Purchase</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Product Grid component
const ProductGrid = ({ products }: { products: ProductType[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const PremiumStudyMaterials = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const { folders } = useFolders();

  const premiumFolders = folders.filter(folder => folder.is_premium);
  
  const filteredProducts = selectedFolder === 'all' 
    ? products
    : selectedFolder === 'no-folder'
    ? products.filter(product => !product.folder_id)
    : products.filter(product => product.folder_id === selectedFolder);

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
          duration_type: item.duration_type,
          folder_id: item.folder_id
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

      {/* Folder Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedFolder === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFolder('all')}
        >
          All Materials
        </Button>
        <Button
          variant={selectedFolder === 'no-folder' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFolder('no-folder')}
        >
          No Folder
        </Button>
        {premiumFolders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolder === folder.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFolder(folder.id)}
            className="flex items-center gap-1"
          >
            <Folder size={12} />
            {folder.name}
          </Button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading premium materials...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          {selectedFolder === 'all' 
            ? "No premium study materials found"
            : `No materials found in this ${selectedFolder === 'no-folder' ? 'section' : 'folder'}.`
          }
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
};

export default PremiumStudyMaterials;
