
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video, Edit, Trash, ExternalLink, Youtube, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import VideoUploadDialog from './VideoUploadDialog';
import VideoFolderManagement from './VideoFolderManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define TypeScript interface for the video object
interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  folder_id: string | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
}

interface TrainingVideoFolder {
  id: string;
  name: string;
  description: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to extract YouTube video ID from URL
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

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const VideosTab = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [folders, setFolders] = useState<TrainingVideoFolder[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch videos and folders on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      console.log("Fetching videos and folders...");
      setLoading(true);
      
      // Fetch videos and folders in parallel
      const [videosResult, foldersResult] = await Promise.all([
        supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('training_video_folders')
          .select('*')
          .order('name')
      ]);
          
      if (videosResult.error) {
        console.error("Error fetching videos:", videosResult.error);
        throw videosResult.error;
      }
      
      if (foldersResult.error) {
        console.error("Error fetching folders:", foldersResult.error);
        throw foldersResult.error;
      }
      
      console.log("Data fetched successfully:", {
        videos: videosResult.data?.length || 0,
        folders: foldersResult.data?.length || 0
      });
      
      setVideos(videosResult.data || []);
      setFolders(foldersResult.data || []);
    } catch (error: any) {
      console.error("Error in fetchData:", error);
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    
    try {
      const { error } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setVideos(videos.filter(video => video.id !== id));
      
      toast({
        title: "Video deleted",
        description: "The video has been successfully deleted."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const VideoThumbnail = ({ video }: { video: TrainingVideo }) => {
    const isYouTube = isYouTubeUrl(video.video_url);
    const videoId = isYouTube ? getYouTubeVideoId(video.video_url) : null;
    const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : video.thumbnail_url;

    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Failed to load video thumbnail:', thumbnailUrl);
              // Fallback to a default thumbnail if YouTube thumbnail fails
              const target = e.target as HTMLImageElement;
              if (videoId) {
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              } else {
                target.src = '/placeholder.svg';
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
          <div className="p-2 rounded-full bg-black bg-opacity-50">
            {isYouTube ? (
              <Youtube size={20} className="text-red-500" fill="currentColor" />
            ) : (
              <Video size={20} className="text-white" fill="currentColor" />
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
    );
  };

  const VideoCard = ({ video }: { video: TrainingVideo }) => {
    const isYouTube = isYouTubeUrl(video.video_url);
    const folder = folders.find(f => f.id === video.folder_id);
    
    return (
      <Card className="overflow-hidden h-full">
        <VideoThumbnail video={video} />
        
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-base flex items-center gap-2 line-clamp-2 leading-tight min-h-[3rem]" title={video.title}>
              <span className="truncate">{video.title}</span>
              {isYouTube && <Youtube size={16} className="text-red-500 flex-shrink-0" />}
            </h3>
            <div className="flex space-x-1 flex-shrink-0 ml-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setEditingVideo(video)}
              >
                <Edit size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 h-8 w-8 p-0"
                onClick={() => handleDelete(video.id)}
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
          
          {video.description && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-tight flex-grow" title={video.description}>
              {video.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {folder && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Folder size={10} />
                <span className="truncate max-w-[80px]" title={folder.name}>{folder.name}</span>
              </span>
            )}
            
            {video.category && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full truncate max-w-[100px]" title={video.category}>
                {video.category}
              </span>
            )}

            {video.is_premium && (
              <span className="text-xs bg-academy-red text-white px-2 py-1 rounded-full">
                Premium
              </span>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-gray-500 truncate">
              {new Date(video.created_at).toLocaleDateString()}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-8"
              asChild
            >
              <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={12} className="mr-1" /> 
                {isYouTube ? 'YouTube' : 'View'}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VideosByFolder = () => {
    const videosWithoutFolder = videos.filter(v => !v.folder_id);
    
    return (
      <div className="space-y-8">
        {/* Videos without folder */}
        {videosWithoutFolder.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-700">Unorganized Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videosWithoutFolder.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Videos by folder */}
        {folders.map(folder => {
          const folderVideos = videos.filter(v => v.folder_id === folder.id);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-academy-primary">Training Videos Management</h2>
        <Button 
          className="bg-academy-primary hover:bg-academy-primary/90"
          onClick={() => setIsUploading(true)}
        >
          <Plus size={16} className="mr-2" />
          Add New Video
        </Button>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <p>Loading videos...</p>
            </div>
          ) : videos.length > 0 ? (
            <VideosByFolder />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex flex-col items-center py-10">
                <Youtube size={64} className="text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Start uploading training videos or adding YouTube links for your students by clicking the "Add New Video" button.
                </p>
              </div>
            </div>
          )}
          
          {/* Video management tips card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Video Management Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>YouTube videos and shorts are automatically detected and will show proper thumbnails.</li>
                <li>For YouTube videos, paste the full URL (youtube.com/watch?v=... or youtu.be/...).</li>
                <li>YouTube Shorts URLs (youtube.com/shorts/...) are also supported.</li>
                <li>Organize videos into folders for better student navigation.</li>
                <li>Add clear titles and descriptions to help students find content.</li>
                <li>Use categories to further organize your content within folders.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="folders">
          <VideoFolderManagement />
        </TabsContent>
      </Tabs>
      
      {/* Upload dialog */}
      <VideoUploadDialog 
        isOpen={isUploading} 
        onClose={() => setIsUploading(false)}
        onSuccess={(newVideo) => {
          setVideos([newVideo, ...videos]);
          setIsUploading(false);
        }}
      />
      
      {/* Edit dialog */}
      {editingVideo && (
        <VideoUploadDialog 
          isOpen={!!editingVideo} 
          onClose={() => setEditingVideo(null)}
          onSuccess={(updatedVideo) => {
            setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
            setEditingVideo(null);
          }}
          videoToEdit={editingVideo}
        />
      )}
    </div>
  );
};

export default VideosTab;
