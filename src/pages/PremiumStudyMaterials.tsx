
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Folder, Clock, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFolders } from '@/hooks/useFolders';
import FolderCard from '@/components/FolderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMaterialAccess } from '@/hooks/useMaterialAccess';
import { useAuth } from '@/context/AuthContext';

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
  isUpcoming?: boolean;
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
  const { user } = useAuth();
  const { hasAccess, loading: checkingAccess } = useMaterialAccess(product.id);
  
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
            <span className="text-lg font-bold text-academy-red">
              {product.isUpcoming && product.price === 0 ? 'Price TBA' : `₹${product.price.toFixed(2)}`}
            </span>
            {(product.duration_months || product.duration_type) && (
              <span className="text-sm text-academy-secondary font-medium">
                {formatDuration(product.duration_months, product.duration_type)}
              </span>
            )}
          </div>
          {product.isUpcoming ? (
            <div className="w-full">
              <div className="flex items-center justify-center text-academy-secondary text-sm mb-2">
                <Clock className="h-4 w-4 mr-1" />
                Coming Soon
              </div>
              <Button 
                className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                disabled
              >
                Not Available Yet
              </Button>
            </div>
          ) : checkingAccess ? (
            <Button 
              className="w-full bg-gray-300 text-gray-600"
              disabled
            >
              Checking access...
            </Button>
          ) : user && hasAccess ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <Link to={`/material/${product.id}/access`}>
                <Eye className="mr-2 h-4 w-4" />
                Open Material
              </Link>
            </Button>
          ) : (
            <Button 
              className="w-full bg-academy-red hover:bg-academy-red/90 text-white"
              asChild
            >
              <Link to={`/purchase/${product.id}`}>Purchase Now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const PremiumStudyMaterials = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFolderId = searchParams.get('folderId');
  const { folders } = useFolders();

  const premiumFolders = folders.filter(folder => folder.is_premium);
  const availableProducts = products.filter(product => !product.isUpcoming);
  const upcomingProducts = products.filter(product => product.isUpcoming);

  const getFilteredProducts = (productsArray: ProductType[]) => {
    return selectedFolderId 
      ? productsArray.filter(product => product.folder_id === selectedFolderId)
      : productsArray.filter(product => !product.folder_id);
  };

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
          folder_id: item.folder_id,
          isUpcoming: item.is_upcoming
        }));
        setProducts(products);
      }
    } catch (error) {
      console.error('Error fetching premium materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setSearchParams({ folderId });
  };

  const handleBackToFolders = () => {
    setSearchParams({});
  };

  const selectedFolder = premiumFolders.find(f => f.id === selectedFolderId);

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

      {selectedFolderId ? (
        // Show materials in selected folder
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToFolders}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Folders
            </Button>
            <div className="flex items-center gap-2">
              <Folder size={20} className="text-academy-red" />
              <h2 className="text-xl font-semibold">{selectedFolder?.name}</h2>
            </div>
          </div>

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="available">Available ({getFilteredProducts(availableProducts).length})</TabsTrigger>
              <TabsTrigger value="upcoming">Coming Soon ({getFilteredProducts(upcomingProducts).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              {loading ? (
                <div className="text-center py-8">Loading premium materials...</div>
              ) : getFilteredProducts(availableProducts).length === 0 ? (
                <div className="text-center py-8">
                  No available materials found in this folder.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getFilteredProducts(availableProducts).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {loading ? (
                <div className="text-center py-8">Loading premium materials...</div>
              ) : getFilteredProducts(upcomingProducts).length === 0 ? (
                <div className="text-center py-8">
                  No upcoming materials found in this folder.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getFilteredProducts(upcomingProducts).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Show folders and loose materials
        <div className="space-y-8">
          {/* Folders Section */}
          {premiumFolders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="text-academy-red" />
                Premium Folders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {premiumFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onClick={() => handleFolderClick(folder.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Materials Section with Tabs */}
          <div>
            <Tabs defaultValue="available" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="available">Available Materials ({getFilteredProducts(availableProducts).length})</TabsTrigger>
                <TabsTrigger value="upcoming">Coming Soon ({getFilteredProducts(upcomingProducts).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="available">
                {loading ? (
                  <div className="text-center py-8">Loading premium materials...</div>
                ) : getFilteredProducts(availableProducts).length === 0 ? (
                  <div className="text-center py-8">
                    No available premium materials found.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getFilteredProducts(availableProducts).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {loading ? (
                  <div className="text-center py-8">Loading premium materials...</div>
                ) : getFilteredProducts(upcomingProducts).length === 0 ? (
                  <div className="text-center py-8">
                    No upcoming premium materials found.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getFilteredProducts(upcomingProducts).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumStudyMaterials;
