
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

const StudyMaterials = () => {
  const [freeMaterials, setFreeMaterials] = useState<StudyMaterial[]>([]);
  const [paidMaterials, setPaidMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const materials = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          downloadUrl: item.downloadurl || "",
          thumbnailUrl: item.thumbnailurl || undefined,
          isPremium: item.ispremium || false,
          price: item.price
        }));

        setFreeMaterials(materials.filter(m => !m.isPremium));
        setPaidMaterials(materials.filter(m => m.isPremium));
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMaterialsLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-md">
          <Skeleton className="w-full h-32 mb-2" />
          <Skeleton className="w-3/4 h-5 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-1/3 h-8" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">Study Materials</h1>
      
      <Tabs defaultValue="free" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="free" className="flex-1">Free Materials</TabsTrigger>
          <TabsTrigger value="premium" className="flex-1">Premium Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free" className="mt-4">
          {loading ? (
            renderMaterialsLoadingState()
          ) : freeMaterials.length === 0 ? (
            <div className="text-center py-8">No free study materials found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-academy-primary hover:shadow-lg transition-shadow"
                >
                  {material.thumbnailUrl && (
                    <img 
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
                  <p className="text-gray-600 mb-4">{material.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-academy-primary hover:text-academy-red hover:bg-gray-100"
                    asChild
                  >
                    <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="mt-4">
          {loading ? (
            renderMaterialsLoadingState()
          ) : paidMaterials.length === 0 ? (
            <div className="text-center py-8">No premium study materials found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidMaterials.map((material) => (
                <div 
                  key={material.id}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-academy-red hover:shadow-lg transition-shadow"
                >
                  {material.thumbnailUrl && (
                    <img 
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
                    <span className="font-semibold text-academy-red">₹{material.price}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{material.description}</p>
                  <Button 
                    size="sm" 
                    className="bg-academy-red hover:bg-academy-red/90 text-white"
                    asChild
                  >
                    <Link to={`/premium-materials?materialId=${material.id}`}>
                      Purchase Now
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyMaterials;
