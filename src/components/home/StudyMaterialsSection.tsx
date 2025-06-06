
import { Book, Download, ExternalLink, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  folder_id?: string;
  isUpcoming?: boolean;
}

interface StudyMaterialsSectionProps {
  freeMaterials?: StudyMaterial[];
  paidMaterials?: StudyMaterial[];
  loading?: boolean;
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

const StudyMaterialsSection = ({ 
  freeMaterials: propFreeMaterials, 
  paidMaterials: propPaidMaterials,
  loading: propLoading = false
}: StudyMaterialsSectionProps) => {
  const [freeMaterials, setFreeMaterials] = useState<StudyMaterial[]>([]);
  const [paidMaterials, setPaidMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propFreeMaterials || propPaidMaterials) {
      setFreeMaterials(propFreeMaterials || []);
      setPaidMaterials(propPaidMaterials || []);
      setLoading(propLoading);
    } else {
      fetchMaterials();
    }
  }, [propFreeMaterials, propPaidMaterials, propLoading]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        throw error;
      }

      if (data) {
        const materials = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          downloadUrl: item.downloadurl || "",
          thumbnailUrl: item.thumbnailurl,
          isPremium: item.ispremium,
          price: item.price,
          folder_id: item.folder_id,
          isUpcoming: item.is_upcoming || false
        }));

        setFreeMaterials(materials.filter(m => !m.isPremium).slice(0, 3));
        setPaidMaterials(materials.filter(m => m.isPremium).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMaterialsLoadingState = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-3">
          <Skeleton className="w-10 h-10 mx-auto mb-2 rounded-lg" />
          <Skeleton className="w-full h-3 mb-1" />
          <Skeleton className="w-3/4 h-3 mx-auto" />
        </div>
      ))}
    </div>
  );

  const MaterialCard = ({ material, isPremium = false }: { material: StudyMaterial; isPremium?: boolean }) => {
    const IconComponent = getIconForMaterial(material.title);
    
    return (
      <div className={`bg-gray-50 rounded-lg p-3 transition-all hover:shadow-sm cursor-pointer relative ${
        isPremium ? 'border-l-4 border-l-academy-red' : 'border-l-4 border-l-academy-primary'
      }`}>
        {material.isUpcoming && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        )}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-2 rounded-lg ${
            isPremium ? 'bg-academy-red/10' : 'bg-academy-primary/10'
          } ${material.isUpcoming ? 'opacity-60' : ''}`}>
            <IconComponent 
              size={24} 
              className={`${isPremium ? 'text-academy-red' : 'text-academy-primary'} ${material.isUpcoming ? 'opacity-60' : ''}`} 
            />
          </div>
          <h5 className={`font-semibold text-sm line-clamp-2 min-h-[2rem] ${material.isUpcoming ? 'text-gray-500' : ''}`}>
            {material.title}
          </h5>
          {isPremium && material.price && !material.isUpcoming && (
            <div className="text-xs font-semibold text-academy-red">₹{material.price}</div>
          )}
          <div className="w-full">
            {material.isUpcoming ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300"
                disabled
              >
                Not Available Yet
              </Button>
            ) : isPremium ? (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-academy-red hover:bg-academy-red/90 text-white text-xs"
                asChild
              >
                <Link to={`/premium-materials?materialId=${material.id}`}>Purchase</Link>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-academy-primary hover:text-academy-red hover:bg-gray-100 text-xs"
                asChild
              >
                <Link to={`/material/${material.id}/access`}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-6">Study Materials</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-primary">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-academy-primary mr-2" />
            <h4 className="text-lg font-semibold">Free Study Materials</h4>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              renderMaterialsLoadingState()
            ) : freeMaterials.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No free materials available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {freeMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-academy-primary text-academy-primary hover:bg-academy-light"
            asChild
          >
            <Link to="/study-materials">
              <ExternalLink className="h-4 w-4 mr-1" /> Browse All Free Materials
            </Link>
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-red">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-academy-red mr-2" />
            <h4 className="text-lg font-semibold">Premium Study Materials</h4>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              renderMaterialsLoadingState()
            ) : paidMaterials.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No premium materials available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paidMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} isPremium />
                ))}
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-4 bg-academy-red hover:bg-academy-red/90 text-white"
            asChild
          >
            <Link to="/study-materials">
              <ExternalLink className="h-4 w-4 mr-1" /> View All Premium Materials
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudyMaterialsSection;
