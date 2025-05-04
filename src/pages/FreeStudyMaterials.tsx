
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

const FreeStudyMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
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
        .eq('ispremium', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setMaterials(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          downloadUrl: item.downloadurl,
          thumbnailUrl: item.thumbnailurl
        })));
      }
    } catch (error) {
      console.error('Error fetching free materials:', error);
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
        <h1 className="text-2xl font-bold text-academy-primary">Free Study Materials</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8">No free study materials found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
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
    </div>
  );
};

export default FreeStudyMaterials;
