import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Download, ExternalLink, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Video, Play, Youtube, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFolders } from '@/hooks/useFolders';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  folder_id?: string;
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

// Helper functions for YouTube integration
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

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
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [selectedFreeFolder, setSelectedFreeFolder] = useState<string>('all');
  const [selectedPremiumFolder, setSelectedPremiumFolder] = useState<string>('all');
  const { folders } = useFolders();

  const freeFolders = folders.filter(folder => !folder.is_premium);
  const premiumFolders = folders.filter(folder => folder.is_premium);
  
  const filteredFreeMaterials = selectedFreeFolder === 'all' 
    ? freeMaterials
    : selectedFreeFolder === 'no-folder'
    ? freeMaterials.filter(material => !material.folder_id)
    : freeMaterials.filter(material => material.folder_id === selectedFreeFolder);

  const filteredPaidMaterials = selectedPremiumFolder === 'all' 
    ? paidMaterials
    : selectedPremiumFolder === 'no-folder'
    ? paidMaterials.filter(material => !material.folder_id)
    : paidMaterials.filter(material => material.folder_id === selectedPremiumFolder);

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
          price: item.price,
          folder_id: item.folder_id
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
    const isYouTube = isYouTubeUrl(video.video_url);
    const videoId = isYouTube ? getYouTubeVideoId(video.video_url) : null;
    const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : video.thumbnail_url;

    return (
      <div 
        className={`bg-white rounded-lg p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
          video.is_premium ? 'border-l-4 border-l-academy-red' : 'border-l-4 border-l-academy-primary'
        }`}
        onClick={() => setSelectedVideo(video)}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (videoId) {
                    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                {isYouTube ? (
                  <Youtube size={32} className="text-red-500" />
                ) : (
                  <Video size={32} className="text-gray-400" />
                )}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`p-2 rounded-full bg-black bg-opacity-50 ${
                video.is_premium ? 'text-academy-red' : 'text-white'
              }`}>
                {isYouTube ? (
                  <Youtube size={20} className="text-red-500" fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </div>
            </div>
            {isYouTube && (
              <div className="absolute top-2 right-2">
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                  YouTube
                </div>
              </div>
            )}
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVideo(video);
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Watch Video
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const VideoPlayerDialog = ({ video, onClose }: { video: TrainingVideo; onClose: () => void }) => {
    const isYouTube = isYouTubeUrl(video.video_url);
    const videoId = isYouTube ? getYouTubeVideoId(video.video_url) : null;
    const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : video.video_url;

    return (
      <Dialog open={!!video} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {video.title}
              {isYouTube && <Youtube size={20} className="text-red-500" />}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {isYouTube ? (
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.video_url}
                controls
                className="w-full h-full rounded-lg"
                poster={video.thumbnail_url}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          {video.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600 text-sm">{video.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
          {/* Free Materials Folder Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedFreeFolder === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFreeFolder('all')}
            >
              All Materials
            </Button>
            <Button
              variant={selectedFreeFolder === 'no-folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFreeFolder('no-folder')}
            >
              No Folder
            </Button>
            {freeFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFreeFolder === folder.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFreeFolder(folder.id)}
                className="flex items-center gap-1"
              >
                <Folder size={12} />
                {folder.name}
              </Button>
            ))}
          </div>

          {loading ? (
            renderMaterialsLoadingState()
          ) : filteredFreeMaterials.length === 0 ? (
            <div className="text-center py-8">
              {selectedFreeFolder === 'all' 
                ? "No free study materials found"
                : `No materials found in this ${selectedFreeFolder === 'no-folder' ? 'section' : 'folder'}.`
              }
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFreeMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="mt-4">
          {/* Premium Materials Folder Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedPremiumFolder === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPremiumFolder('all')}
            >
              All Materials
            </Button>
            <Button
              variant={selectedPremiumFolder === 'no-folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPremiumFolder('no-folder')}
            >
              No Folder
            </Button>
            {premiumFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedPremiumFolder === folder.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPremiumFolder(folder.id)}
                className="flex items-center gap-1"
              >
                <Folder size={12} />
                {folder.name}
              </Button>
            ))}
          </div>

          {loading ? (
            renderMaterialsLoadingState()
          ) : filteredPaidMaterials.length === 0 ? (
            <div className="text-center py-8">
              {selectedPremiumFolder === 'all' 
                ? "No premium study materials found"
                : `No materials found in this ${selectedPremiumFolder === 'no-folder' ? 'section' : 'folder'}.`
              }
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPaidMaterials.map((material) => (
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
              <Youtube size={64} className="text-red-500 mx-auto mb-4" />
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

      {/* Video Player Dialog */}
      {selectedVideo && (
        <VideoPlayerDialog
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default StudyMaterials;
