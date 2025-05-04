
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video, Edit, Trash, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import VideoUploadDialog from './VideoUploadDialog';

// Define TypeScript interface for the video object
interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
}

const VideosTab = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [loading, setLoading] = useState(true);
  
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
          {videos.map(video => (
            <Card key={video.id} className="overflow-hidden">
              <div className="relative aspect-video">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Video size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
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
                
                <p className="text-gray-600 text-sm mt-2">{video.description}</p>
                
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
                      <ExternalLink size={14} className="mr-1" /> View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center mt-6">
          <div className="flex flex-col items-center py-10">
            <Video size={64} className="text-academy-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Start uploading training videos for your students by clicking the "Add New Video" button.
            </p>
          </div>
        </div>
      )}
      
      {/* Video management tips card */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Video Management Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Videos should be in MP4 format for best compatibility.</li>
            <li>Recommended resolution is 720p or 1080p.</li>
            <li>Add clear titles and descriptions to help students find content.</li>
            <li>Organize videos by topic or course for better navigation.</li>
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
