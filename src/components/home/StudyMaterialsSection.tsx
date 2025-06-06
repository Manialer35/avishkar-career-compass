
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Book, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  category?: string;
}

const StudyMaterialsSection = () => {
  const [policeMaterials, setPoliceMaterials] = useState<StudyMaterial[]>([]);
  const [combinedMaterials, setCombinedMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        return;
      }

      if (data) {
        const materials = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          downloadUrl: item.downloadurl || "",
          thumbnailUrl: item.thumbnailurl || undefined,
          isPremium: item.ispremium || false,
          price: item.price,
          category: item.category || 'general'
        }));

        // Filter materials based on keywords in title or description
        const police = materials.filter(material => 
          material.title.toLowerCase().includes('police') || 
          material.title.toLowerCase().includes('bharti') ||
          material.description.toLowerCase().includes('police') ||
          material.description.toLowerCase().includes('bharti')
        );

        const combined = materials.filter(material => 
          material.title.toLowerCase().includes('combined') || 
          material.title.toLowerCase().includes('संयुक्त') ||
          material.description.toLowerCase().includes('combined') ||
          material.description.toLowerCase().includes('संयुक्त')
        );

        // If we don't have specific materials, show first 2 for each category
        setPoliceMaterials(police.length > 0 ? police.slice(0, 2) : materials.filter(m => !m.isPremium).slice(0, 2));
        setCombinedMaterials(combined.length > 0 ? combined.slice(0, 2) : materials.filter(m => m.isPremium).slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching study materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const MaterialCard = ({ material, type }: { material: StudyMaterial; type: 'police' | 'combined' }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${type === 'police' ? 'bg-academy-primary/10' : 'bg-academy-red/10'}`}>
          <FileText 
            size={20} 
            className={type === 'police' ? 'text-academy-primary' : 'text-academy-red'} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{material.title}</h4>
          {material.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{material.description}</p>
          )}
          <div className="flex items-center justify-between">
            {material.isPremium ? (
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-academy-red" />
                <span className="text-xs font-medium text-academy-red">₹{material.price}</span>
              </div>
            ) : (
              <span className="text-xs text-green-600 font-medium">Free</span>
            )}
            {material.isPremium ? (
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 text-xs text-academy-red hover:text-academy-red hover:bg-red-50"
                asChild
              >
                <Link to={`/premium-materials?materialId=${material.id}`}>
                  Purchase
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-academy-primary hover:text-academy-primary hover:bg-blue-50"
                asChild
              >
                <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download size={12} className="mr-1" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-academy-primary">Study Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Police Bharti Materials</h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Combined Exam Materials</h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-academy-primary">Study Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Police Bharti Materials */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Book className="text-academy-primary" size={20} />
            Police Bharti Materials
          </h3>
          <div className="space-y-3">
            {policeMaterials.length > 0 ? (
              policeMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} type="police" />
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">No materials available yet</p>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-academy-primary border-academy-primary hover:bg-academy-primary hover:text-white"
              asChild
            >
              <Link to="/study-materials?tab=free">View All Free Materials</Link>
            </Button>
          </div>
        </div>

        {/* Combined Exam Materials */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Book className="text-academy-red" size={20} />
            Combined Exam Materials
          </h3>
          <div className="space-y-3">
            {combinedMaterials.length > 0 ? (
              combinedMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} type="combined" />
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">No materials available yet</p>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-academy-red border-academy-red hover:bg-academy-red hover:text-white"
              asChild
            >
              <Link to="/study-materials?tab=premium">View All Premium Materials</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialsSection;
