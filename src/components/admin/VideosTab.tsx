
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video, Edit, Trash, ExternalLink, Youtube, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import VideoUploadDialog from './VideoUploadDialog';
import { useFolders } from '@/hooks/useFolders';

// Define TypeScript interface for the video object
interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_premium: boolean | null;
  folder_id?: string | null;
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

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

// Helper function to check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const VideosTab = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const { folders } = useFolders();
  
  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);
  
  const fetchVideos = async () => {
    try {
      console.log("Fetching videos...");
      setLoading(true);
      
      // Check if session is valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Direct query without checking user_roles to avoid recursion
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });
          
      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
      
      console.log("Videos fetched successfully:", data?.length || 0);
      setVideos(data || []);
    } catch (error: any) {
      console.error("Error in fetchVideos:", error);
      toast({
        title: "Error fetching videos",
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

  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return null;
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Unknown Folder';
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
            onError={(e) => {
              // Fallback to a default thumbnail if YouTube thumbnail fails
              const target = e.target as HTMLImageElement;
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
  
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-academy-primary">Training Videos</h2>
        <Button 
          className="bg-academy-primary hover:bg-academy-primary/90"
          onClick={() => setIsUploading(true)}
        >
          <Plus size={16} className="mr-2" />
          Add New Video
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading videos...</p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {videos.map(video => {
            const isYouTube = isYouTubeUrl(video.video_url);
            const videoId = isYouTube ? getYouTubeVideoId(video.video_url) : null;
            const folderName = getFolderName(video.folder_id);
            
            return (
              <Card key={video.id} className="overflow-hidden">
                <VideoThumbnail video={video} />
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {video.title}
                      {isYouTube && <Youtube size={16} className="text-red-500" />}
                    </h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingVideo(video)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {folderName && (
                    <div className="mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Folder size={12} />
                        {folderName}
                      </span>
                    </div>
                  )}
                  
                  {video.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{video.description}</p>
                  )}

                  {video.category && (
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                    </div>
                  )}

                  {video.is_premium && (
                    <div className="mt-2">
                      <span className="text-xs bg-academy-red text-white px-2 py-1 rounded-full">
                        Premium
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      asChild
                    >
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} className="mr-1" /> 
                        {isYouTube ? 'Watch on YouTube' : 'View'}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center mt-6">
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
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Video Management Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>YouTube videos and shorts are automatically detected and will show proper thumbnails.</li>
            <li>For YouTube videos, paste the full URL (youtube.com/watch?v=... or youtu.be/...).</li>
            <li>YouTube Shorts URLs (youtube.com/shorts/...) are also supported.</li>
            <li>Videos should be in MP4 format for best compatibility if uploading directly.</li>
            <li>Add clear titles and descriptions to help students find content.</li>
            <li>Organize videos by topic or course for better navigation.</li>
            <li>Use folders to organize videos by subject or course for easier management.</li>
          </ul>
        </CardContent>
      </Card>
      
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
    </>
  );
};

export default VideosTab;
