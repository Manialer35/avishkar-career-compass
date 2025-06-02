import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Download, ExternalLink, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Video, Play } from 'lucide-react';
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

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  is_premium: boolean;
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
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
    fetchTrainingVideos();
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

  const fetchTrainingVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTrainingVideos(data);
      }
    } catch (error) {
      console.error('Error fetching training videos:', error);
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

  const VideoCard = ({ video }: { video: TrainingVideo }) => {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
        video.is_premium ? 'border-l-4 border-l-academy-red' : 'border-l-4 border-l-academy-primary'
      }`}>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            {video.thumbnail_url ? (
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Video size={32} className="text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`p-2 rounded-full bg-black bg-opacity-50 ${
                video.is_premium ? 'text-academy-red' : 'text-white'
              }`}>
                <Play size={20} fill="currentColor" />
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{video.title}</h3>
          {video.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{video.description}</p>
          )}
          <div className="text-xs text-gray-500 capitalize">{video.category}</div>
          {video.is_premium && (
            <div className="text-sm font-semibold text-academy-red">Premium</div>
          )}
          <div className="w-full pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full text-xs ${
                video.is_premium 
                  ? 'text-academy-red hover:text-academy-red hover:bg-red-50' 
                  : 'text-academy-primary hover:text-academy-red hover:bg-gray-100'
              }`}
              asChild
            >
              <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                <Play className="h-3 w-3 mr-1" />
                Watch Video
              </a>
            </Button>
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
          <TabsTrigger value="videos" className="flex-1">Training Videos</TabsTrigger>
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

        <TabsContent value="videos" className="mt-4">
          {loading ? (
            renderMaterialsLoadingState()
          ) : trainingVideos.length === 0 ? (
            <div className="text-center py-8">
              <Video size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Training Videos Yet</h3>
              <p className="text-gray-600">Training videos will be available here soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trainingVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyMaterials;
