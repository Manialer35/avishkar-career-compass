
import { Book, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

interface StudyMaterialsSectionProps {
  freeMaterials?: StudyMaterial[];
  paidMaterials?: StudyMaterial[];
  loading?: boolean;
}

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
          price: item.price
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
              freeMaterials.map((material) => (
                <div key={material.id} className="p-4 bg-gray-50 rounded-md">
                  {material.thumbnailUrl && (
                    <img 
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h5 className="font-semibold">{material.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-academy-primary hover:text-academy-red hover:bg-gray-100"
                    asChild
                  >
                    <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Download Now
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-academy-primary text-academy-primary hover:bg-academy-light"
            asChild
          >
            <Link to="/free-materials">
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
              paidMaterials.map((material) => (
                <div key={material.id} className="p-4 bg-gray-50 rounded-md">
                  {material.thumbnailUrl && (
                    <img 
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="flex justify-between">
                    <h5 className="font-semibold">{material.title}</h5>
                    <span className="font-semibold text-academy-red">₹{material.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="mt-2 bg-academy-red hover:bg-academy-red/90 text-white"
                    asChild
                  >
                    <Link to={`/premium-materials?materialId=${material.id}`}>Purchase Now</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <Button 
            className="w-full mt-4 bg-academy-red hover:bg-academy-red/90 text-white"
            asChild
          >
            <Link to="/premium-materials">
              <ExternalLink className="h-4 w-4 mr-1" /> View All Premium Materials
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudyMaterialsSection;
