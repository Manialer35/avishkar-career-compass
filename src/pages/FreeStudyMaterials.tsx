
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Book, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Folder, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFolders } from '@/hooks/useFolders';
import FolderCard from '@/components/FolderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
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

const FreeStudyMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFolderId = searchParams.get('folderId');
  const { folders } = useFolders();

  const freeFolders = folders.filter(folder => !folder.is_premium);
  const availableMaterials = materials.filter(material => !material.isUpcoming);
  const upcomingMaterials = materials.filter(material => material.isUpcoming);

  const getFilteredMaterials = (materialsArray: StudyMaterial[]) => {
    return selectedFolderId 
      ? materialsArray.filter(material => material.folder_id === selectedFolderId)
      : materialsArray.filter(material => !material.folder_id);
  };

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
          folder_id: item.folder_id,
          isUpcoming: item.is_upcoming
        })));
      }
    } catch (error) {
      console.error('Error fetching free materials:', error);
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

  const selectedFolder = freeFolders.find(f => f.id === selectedFolderId);

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
          {material.isUpcoming ? (
            <div className="w-full">
              <div className="flex items-center justify-center text-academy-secondary text-sm mb-2">
                <Clock className="h-4 w-4 mr-1" />
                Coming Soon
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled
              >
                Not Available Yet
              </Button>
            </div>
          ) : (
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
          )}
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
              <Folder size={20} className="text-academy-primary" />
              <h2 className="text-xl font-semibold">{selectedFolder?.name}</h2>
            </div>
          </div>

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="available">Available ({getFilteredMaterials(availableMaterials).length})</TabsTrigger>
              <TabsTrigger value="upcoming">Coming Soon ({getFilteredMaterials(upcomingMaterials).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              {loading ? (
                <div className="text-center py-8">Loading materials...</div>
              ) : getFilteredMaterials(availableMaterials).length === 0 ? (
                <div className="text-center py-8">
                  No available materials found in this folder.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getFilteredMaterials(availableMaterials).map((material) => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {loading ? (
                <div className="text-center py-8">Loading materials...</div>
              ) : getFilteredMaterials(upcomingMaterials).length === 0 ? (
                <div className="text-center py-8">
                  No upcoming materials found in this folder.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getFilteredMaterials(upcomingMaterials).map((material) => (
                    <MaterialCard key={material.id} material={material} />
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
          {freeFolders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="text-academy-primary" />
                Material Folders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {freeFolders.map((folder) => (
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
                <TabsTrigger value="available">Available Materials ({getFilteredMaterials(availableMaterials).length})</TabsTrigger>
                <TabsTrigger value="upcoming">Coming Soon ({getFilteredMaterials(upcomingMaterials).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="available">
                {loading ? (
                  <div className="text-center py-8">Loading materials...</div>
                ) : getFilteredMaterials(availableMaterials).length === 0 ? (
                  <div className="text-center py-8">
                    No available materials found.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getFilteredMaterials(availableMaterials).map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {loading ? (
                  <div className="text-center py-8">Loading materials...</div>
                ) : getFilteredMaterials(upcomingMaterials).length === 0 ? (
                  <div className="text-center py-8">
                    No upcoming materials found.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getFilteredMaterials(upcomingMaterials).map((material) => (
                      <MaterialCard key={material.id} material={material} />
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

export default FreeStudyMaterials;
