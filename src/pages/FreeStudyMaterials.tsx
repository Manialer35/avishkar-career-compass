
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Book, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFolders } from '@/hooks/useFolders';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
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

const FreeStudyMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const { folders } = useFolders();

  const freeFolders = folders.filter(folder => !folder.is_premium);
  
  const filteredMaterials = selectedFolder === 'all' 
    ? materials
    : selectedFolder === 'no-folder'
    ? materials.filter(material => !material.folder_id)
    : materials.filter(material => material.folder_id === selectedFolder);

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
          thumbnailUrl: item.thumbnailurl,
          folder_id: item.folder_id
        })));
      }
    } catch (error) {
      console.error('Error fetching free materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const MaterialCard = ({ material }: { material: StudyMaterial }) => {
    const IconComponent = getIconForMaterial(material.title);
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-academy-primary transition-all hover:shadow-lg">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-lg bg-academy-primary/10">
            <IconComponent size={32} className="text-academy-primary" />
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">{material.title}</h3>
          {material.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{material.description}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-academy-primary hover:text-academy-red hover:bg-gray-100"
            asChild
          >
            <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Now
            </a>
          </Button>
        </div>
      </div>
    );
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
        {freeFolders.map((folder) => (
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
        <div className="text-center py-8">Loading materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-8">
          {selectedFolder === 'all' 
            ? "No free study materials found"
            : `No materials found in this ${selectedFolder === 'no-folder' ? 'section' : 'folder'}.`
          }
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeStudyMaterials;
