import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Download, ExternalLink, FileText, BookOpen, GraduationCap, Calculator, Users, MapPin, Calendar, Building, Video, Play, Youtube, Folder, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFolders } from '@/hooks/useFolders';
import FolderCard from '@/components/FolderCard';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  is_premium: boolean;
  folder_id?: string;
}

interface TrainingVideoFolder {
  id: string;
  name: string;
  description?: string;
  is_premium: boolean;
  videoCount?: number;
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
  const { toast } = useToast();
  const [freeMaterials, setFreeMaterials] = useState<StudyMaterial[]>([]);
  const [paidMaterials, setPaidMaterials] = useState<StudyMaterial[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [videoFolders, setVideoFolders] = useState<TrainingVideoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFolderId = searchParams.get('folderId');
  const tab = searchParams.get('tab') || 'free';
  const { folders } = useFolders();

  const freeFolders = folders.filter(folder => !folder.is_premium);
  const premiumFolders = folders.filter(folder => folder.is_premium);
  const freeVideoFolders = videoFolders.filter(folder => !folder.is_premium);
  const premiumVideoFolders = videoFolders.filter(folder => folder.is_premium);

  const freeMaterialsInFolder = selectedFolderId 
    ? freeMaterials.filter(material => material.folder_id === selectedFolderId)
    : freeMaterials.filter(material => !material.folder_id);

  const paidMaterialsInFolder = selectedFolderId 
    ? paidMaterials.filter(material => material.folder_id === selectedFolderId)
    : paidMaterials.filter(material => !material.folder_id);

  const videosInFolder = selectedFolderId 
    ? trainingVideos.filter(video => video.folder_id === selectedFolderId)
    : trainingVideos.filter(video => !video.folder_id);

  // Split materials into available and upcoming
  const availableFreeMaterials = freeMaterialsInFolder.filter(material => !material.isUpcoming);
  const upcomingFreeMaterials = freeMaterialsInFolder.filter(material => material.isUpcoming);
  const availablePaidMaterials = paidMaterialsInFolder.filter(material => !material.isUpcoming);
  const upcomingPaidMaterials = paidMaterialsInFolder.filter(material => material.isUpcoming);

  useEffect(() => {
    fetchMaterials();
    fetchTrainingVideos();
  }, []);

  // Fetch video folders after videos are loaded
  useEffect(() => {
    if (trainingVideos.length >= 0) { // Changed condition to include empty arrays
      fetchVideoFolders();
    }
  }, [trainingVideos]);

  const fetchMaterials = async () => {
    try {
      console.log('Fetching study materials...');
      setLoading(true);
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Study materials fetch result:', { data, error });

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`Found ${data.length} study materials, processing...`);
        
        const materials = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          downloadUrl: item.downloadurl || "",
          thumbnailUrl: item.thumbnailurl || undefined,
          isPremium: item.ispremium || false,
          price: item.price,
          folder_id: item.folder_id,
          isUpcoming: item.is_upcoming
        }));

        const free = materials.filter(m => !m.isPremium);
        const paid = materials.filter(m => m.isPremium);
        
        console.log(`Processed: ${free.length} free materials, ${paid.length} paid materials`);

        setFreeMaterials(free);
        setPaidMaterials(paid);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to load study materials. Please try again.",
        variant: "destructive",
      });
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

  const fetchVideoFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('training_video_folders')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        // Calculate video count for each folder using the current trainingVideos state
        const foldersWithCount = data.map(folder => ({
          ...folder,
          videoCount: trainingVideos.filter(video => video.folder_id === folder.id).length
        }));
        setVideoFolders(foldersWithCount);
      }
    } catch (error) {
      console.error('Error fetching video folders:', error);
    }
  };

  const handleFolderClick = (folderId: string, tabName: string) => {
    setSearchParams({ folderId, tab: tabName });
  };

  const handleBackToFolders = () => {
    setSearchParams({ tab });
  };

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const getCurrentFolders = () => {
    if (tab === 'videos') {
      return videoFolders;
    }
    return tab === 'premium' ? premiumFolders : freeFolders;
  };

  const getCurrentVideoFolders = () => {
    return videoFolders;
  };

  const selectedFolder = getCurrentFolders().find(f => f.id === selectedFolderId);

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
      <div className={`bg-white rounded-lg p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer relative ${
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
          <div className={`p-3 rounded-lg ${
            isPremium ? 'bg-academy-red/10' : 'bg-academy-primary/10'
          } ${material.isUpcoming ? 'opacity-60' : ''}`}>
            <IconComponent 
              size={32} 
              className={`${isPremium ? 'text-academy-red' : 'text-academy-primary'} ${material.isUpcoming ? 'opacity-60' : ''}`} 
            />
          </div>
          <h3 className={`font-semibold text-sm line-clamp-2 min-h-[2.5rem] ${material.isUpcoming ? 'text-gray-500' : ''}`}>{material.title}</h3>
          {material.description && (
            <p className={`text-xs text-gray-600 line-clamp-2 ${material.isUpcoming ? 'opacity-60' : ''}`}>{material.description}</p>
          )}
          {isPremium && material.price && !material.isUpcoming && (
            <div className="text-sm font-semibold text-academy-red">₹{material.price}</div>
          )}
          <div className="w-full pt-2">
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
        <div className="flex flex-col space-y-3">
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
          
          <div className="flex flex-col space-y-2 text-center min-h-[5rem]">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight" title={video.title}>
              {video.title}
            </h3>
            {video.description && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-tight" title={video.description}>
                {video.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-gray-500 capitalize text-center">{video.category}</div>
            {video.is_premium && (
              <div className="text-sm font-semibold text-academy-red text-center">Premium</div>
            )}
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

  const VideosByFolder = () => {
    const videosWithoutFolder = videosInFolder.filter(v => !v.folder_id);
    
    return (
      <div className="space-y-8">
        {/* Videos without folder */}
        {videosWithoutFolder.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-700">Unorganized Videos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videosWithoutFolder.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Videos by folder */}
        {videoFolders.map(folder => {
          const folderVideos = trainingVideos.filter(v => v.folder_id === folder.id);
          if (folderVideos.length === 0) return null;

          return (
            <div key={folder.id}>
              <div className="flex items-center gap-2 mb-4">
                <Folder size={20} className="text-academy-primary" />
                <h3 className="text-lg font-medium text-academy-primary">{folder.name}</h3>
                {folder.is_premium && (
                  <span className="text-xs bg-academy-red text-white px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
                <span className="text-sm text-gray-500">({folderVideos.length} videos)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folderVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">Study Materials</h1>
      
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="free" className="flex-1">Free Materials</TabsTrigger>
          <TabsTrigger value="premium" className="flex-1">Premium Materials</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">Training Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free" className="mt-4">
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

              <div className="space-y-8">
                {/* Available Materials Section */}
                {availableFreeMaterials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Materials ({availableFreeMaterials.length})</h3>
                    {loading ? (
                      renderMaterialsLoadingState()
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availableFreeMaterials.map((material) => (
                          <MaterialCard key={material.id} material={material} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coming Soon Materials Section */}
                {upcomingFreeMaterials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="text-yellow-600" />
                      Coming Soon ({upcomingFreeMaterials.length})
                    </h3>
                    {loading ? (
                      renderMaterialsLoadingState()
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {upcomingFreeMaterials.map((material) => (
                          <MaterialCard key={material.id} material={material} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!loading && availableFreeMaterials.length === 0 && upcomingFreeMaterials.length === 0 && (
                  <div className="text-center py-8">
                    No materials found in this folder.
                  </div>
                )}
              </div>
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
                        onClick={() => handleFolderClick(folder.id, 'free')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Available Materials Section */}
              {availableFreeMaterials.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Materials ({availableFreeMaterials.length})</h2>
                  {loading ? (
                    renderMaterialsLoadingState()
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableFreeMaterials.map((material) => (
                        <MaterialCard key={material.id} material={material} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Coming Soon Materials Section */}
              {upcomingFreeMaterials.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="text-yellow-600" />
                    Coming Soon ({upcomingFreeMaterials.length})
                  </h2>
                  {loading ? (
                    renderMaterialsLoadingState()
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {upcomingFreeMaterials.map((material) => (
                        <MaterialCard key={material.id} material={material} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && availableFreeMaterials.length === 0 && upcomingFreeMaterials.length === 0 && freeFolders.length === 0 && (
                <div className="text-center py-8">
                  No free materials found.
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="mt-4">
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
                  <Folder size={20} className="text-academy-red" />
                  <h2 className="text-xl font-semibold">{selectedFolder?.name}</h2>
                </div>
              </div>

              <div className="space-y-8">
                {/* Available Materials Section */}
                {availablePaidMaterials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Materials ({availablePaidMaterials.length})</h3>
                    {loading ? (
                      renderMaterialsLoadingState()
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availablePaidMaterials.map((material) => (
                          <MaterialCard key={material.id} material={material} isPremium />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coming Soon Materials Section */}
                {upcomingPaidMaterials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="text-yellow-600" />
                      Coming Soon ({upcomingPaidMaterials.length})
                    </h3>
                    {loading ? (
                      renderMaterialsLoadingState()
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {upcomingPaidMaterials.map((material) => (
                          <MaterialCard key={material.id} material={material} isPremium />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!loading && availablePaidMaterials.length === 0 && upcomingPaidMaterials.length === 0 && (
                  <div className="text-center py-8">
                    No materials found in this folder.
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show folders and loose materials
            <div className="space-y-8">
              {/* Folders Section */}
              {premiumFolders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Folder className="text-academy-red" />
                    Premium Folders
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {premiumFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onClick={() => handleFolderClick(folder.id, 'premium')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Available Materials Section */}
              {availablePaidMaterials.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Premium Materials ({availablePaidMaterials.length})</h2>
                  {loading ? (
                    renderMaterialsLoadingState()
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availablePaidMaterials.map((material) => (
                        <MaterialCard key={material.id} material={material} isPremium />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Coming Soon Materials Section */}
              {upcomingPaidMaterials.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="text-yellow-600" />
                    Coming Soon ({upcomingPaidMaterials.length})
                  </h2>
                  {loading ? (
                    renderMaterialsLoadingState()
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {upcomingPaidMaterials.map((material) => (
                        <MaterialCard key={material.id} material={material} isPremium />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && availablePaidMaterials.length === 0 && upcomingPaidMaterials.length === 0 && premiumFolders.length === 0 && (
                <div className="text-center py-8">
                  No premium materials found.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          {selectedFolderId ? (
            // Show videos in selected folder
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

              {videosInFolder.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videosInFolder.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  No videos found in this folder.
                </div>
              )}
            </div>
          ) : (
            // Show video folders and loose videos
            <div className="space-y-8">
              {/* Video Folders Section */}
              {videoFolders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Folder className="text-academy-primary" />
                    Video Folders
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {videoFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={{
                          ...folder,
                          materialCount: folder.videoCount
                        }}
                        onClick={() => handleFolderClick(folder.id, 'videos')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                renderMaterialsLoadingState()
              ) : (
                <VideosByFolder />
              )}

              {!loading && trainingVideos.length === 0 && videoFolders.length === 0 && (
                <div className="text-center py-8">
                  <Youtube size={64} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Training Videos Yet</h3>
                  <p className="text-gray-600">Training videos will be available here soon.</p>
                </div>
              )}
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
