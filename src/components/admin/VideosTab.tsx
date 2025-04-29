
import { Button } from '@/components/ui/button';
import { Plus, Video, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const VideosTab = () => {
  const { toast } = useToast();
  
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-academy-primary">Training Videos</h2>
        <Button 
          className="bg-academy-primary hover:bg-academy-primary/90"
          onClick={() => toast({ 
            title: "Coming Soon", 
            description: "Video upload functionality will be available soon." 
          })}
        >
          <Plus size={16} className="mr-2" />
          Add New Video
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-center mt-6">
        <div className="flex flex-col items-center py-10">
          <Video size={64} className="text-academy-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Video Management</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Soon you'll be able to upload and manage training videos for your students directly from this interface.
          </p>
          
          <Button 
            variant="outline" 
            className="border-dashed border-2 border-academy-primary text-academy-primary hover:bg-academy-primary/5"
            onClick={() => toast({ 
              title: "Coming Soon", 
              description: "Video upload functionality will be available soon." 
            })}
          >
            <Upload size={16} className="mr-2" />
            Upload Video
          </Button>
        </div>
      </div>
      
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
    </>
  );
};

export default VideosTab;
