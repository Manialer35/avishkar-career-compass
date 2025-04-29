
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VideosTab = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Training Videos</h2>
        <Button onClick={() => toast({ title: "Coming Soon", description: "Video upload functionality will be available soon." })}>
          <Plus size={16} className="mr-2" />
          Add New Video
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-center mt-4">
        <p className="text-gray-600">Video management is coming soon.</p>
      </div>
    </>
  );
};

export default VideosTab;
