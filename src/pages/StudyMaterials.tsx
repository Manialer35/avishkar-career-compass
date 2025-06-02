
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Download, ExternalLink, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building } from 'lucide-react';
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
          <Skeleton className="w-12 h-12 mx-auto mb-3 rounded-lg" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-3 mx-auto" />
        </div>
      ))}
    </div>
  );

  const MaterialCard = ({ material, isPremium = false }: { material: StudyMaterial; isPremium?: boolean }) => {
    const IconComponent = getIconForMaterial(material.title);
    
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
        isPremium ? 'border-l-4 border-l-academy-red' : 'border-l-4 border-l-academy-primary'
      }`}>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-3 rounded-lg ${
            isPremium ? 'bg-academy-red/10' : 'bg-academy-primary/10'
          }`}>
            <IconComponent 
              size={32} 
              className={isPremium ? 'text-academy-red' : 'text-academy-primary'} 
            />
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{material.title}</h3>
          {material.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{material.description}</p>
          )}
          {isPremium && material.price && (
            <div className="text-sm font-semibold text-academy-red">₹{material.price}</div>
          )}
          <div className="w-full pt-2">
            {isPremium ? (
              <Button 
                size="sm" 
                className="w-full bg-academy-red hover:bg-academy-red/90 text-white text-xs"
                asChild
              >
                <Link to={`/premium-materials?materialId=${material.id}`}>
                  Purchase Now
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-academy-primary hover:text-academy-red hover:bg-gray-100 text-xs"
                asChild
              >
                <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {freeMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paidMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} isPremium />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyMaterials;
