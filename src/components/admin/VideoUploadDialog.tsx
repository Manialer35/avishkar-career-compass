
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, Upload, Image } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_premium: boolean | null;
  folder_id: string | null;
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

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (video: TrainingVideo) => void;
  videoToEdit?: TrainingVideo;
}

const VIDEO_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "police_bharti", label: "Police Bharti" },
  { value: "combined_exam", label: "Combined Exam" },
  { value: "current_affairs", label: "Current Affairs" },
  { value: "aptitude", label: "Aptitude" },
  { value: "interview", label: "Interview" }
];

const VideoUploadDialog = ({ isOpen, onClose, onSuccess, videoToEdit }: VideoUploadDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'general',
    folder_id: '',
    is_premium: false
  });
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [folders, setFolders] = useState<TrainingVideoFolder[]>([]);
  const { toast } = useToast();
  
  // Fetch folders on component mount
  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);
  
  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('training_video_folders')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error("Error fetching folders:", error);
    }
  };
  
  // If editing, populate form with video data
  useEffect(() => {
    if (videoToEdit) {
      // Make sure the category has a valid value
      const category = videoToEdit.category?.toLowerCase() || 'general';
      const validCategory = VIDEO_CATEGORIES.some(c => c.value === category) 
        ? category 
        : 'general';
        
      setFormData({
        title: videoToEdit.title || '',
        description: videoToEdit.description || '',
        video_url: videoToEdit.video_url || '',
        thumbnail_url: videoToEdit.thumbnail_url || '',
        category: validCategory,
        folder_id: videoToEdit.folder_id || '',
        is_premium: videoToEdit.is_premium || false
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        category: 'general',
        folder_id: '',
        is_premium: false
      });
      setThumbnailFile(null);
    }
  }, [videoToEdit, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("You must be logged in to upload videos");
      }
      
      let thumbnailUrl = formData.thumbnail_url;
      
      // Upload thumbnail if provided
      if (thumbnailFile) {
        console.log("Uploading thumbnail file...");
        
        // Check if videos bucket exists, create if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets();
        
        if (!buckets || !buckets.some(bucket => bucket.name === 'videos')) {
          // Create videos bucket
          const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('videos', {
            public: true
          });
          
          if (bucketError) {
            console.error("Error creating videos bucket:", bucketError);
            throw new Error(`Failed to create videos bucket: ${bucketError.message}`);
          }
        }
        
        const filename = `thumbnails/${Date.now()}_${thumbnailFile.name.replace(/\s+/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filename, thumbnailFile);
          
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filename);
          
        thumbnailUrl = publicUrlData.publicUrl;
        console.log("Thumbnail uploaded successfully:", thumbnailUrl);
      }
      
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        thumbnail_url: thumbnailUrl,
        category: formData.category,
        folder_id: formData.folder_id || null,
        is_premium: formData.is_premium,
      };
      
      if (videoToEdit) {
        // Update existing video
        console.log("Updating existing video:", videoToEdit.id);
        const { data, error } = await supabase
          .from('training_videos')
          .update({
            ...videoData,
            updated_at: new Date().toISOString()
          })
          .eq('id', videoToEdit.id)
          .select()
          .single();
          
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        toast({
          title: "Video updated",
          description: "The video has been successfully updated.",
          duration: 3000,
        });
        
        onSuccess(data as TrainingVideo);
      } else {
        // Create new video
        console.log("Creating new video");
        const { data, error } = await supabase
          .from('training_videos')
          .insert(videoData)
          .select()
          .single();
          
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        toast({
          title: "Video added",
          description: "The video has been successfully added.",
          duration: 3000,
        });
        
        onSuccess(data as TrainingVideo);
      }
    } catch (error: any) {
      console.error("Video upload/edit error:", error);
      toast({
        title: videoToEdit ? "Error updating video" : "Error adding video",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{videoToEdit ? "Edit Video" : "Add New Video"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description || ''} 
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (YouTube, Vimeo, etc.)</Label>
            <Input 
              id="video_url" 
              name="video_url"
              value={formData.video_url} 
              onChange={handleChange}
              required
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image</Label>
            <div className="flex items-center space-x-4">
              {(thumbnailFile || formData.thumbnail_url) && (
                <div className="w-16 h-16 relative rounded overflow-hidden">
                  <img 
                    src={thumbnailFile 
                      ? URL.createObjectURL(thumbnailFile) 
                      : formData.thumbnail_url || ''} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input 
                  id="thumbnail"
                  type="file" 
                  onChange={handleThumbnailChange}
                  accept="image/*"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={formData.folder_id} onValueChange={(value) => handleSelectChange(value, 'folder_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, 'category')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {VIDEO_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input 
              id="is_premium"
              name="is_premium"
              type="checkbox"
              checked={formData.is_premium}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <Label htmlFor="is_premium">Premium Video (Paid Access Only)</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-academy-primary hover:bg-academy-primary/90">
              {loading 
                ? (videoToEdit ? "Updating..." : "Adding...") 
                : (videoToEdit ? "Update Video" : "Add Video")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadDialog;
