
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MaterialCard from './MaterialCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

interface FreeMaterialsTabProps {
  materials: StudyMaterial[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: string) => void;
}

const FreeMaterialsTab = ({ materials, loading, onAddNew, onEdit, onDelete }: FreeMaterialsTabProps) => {
  const freeMaterials = materials.filter(material => !material.isPremium);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add touch-scrolling class to improve scrolling on mobile devices
    if (containerRef.current) {
      containerRef.current.classList.add('touch-scrolling');
    }
  }, []);
  
  return (
    <div className="overflow-x-hidden" ref={containerRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Free Study Materials</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage study materials available for free download
          </p>
        </div>
        <Button onClick={onAddNew} size="sm" className="whitespace-nowrap h-8">
          <Plus size={14} className="mr-1" />
          Add New
        </Button>
      </div>
      
      <ScrollArea className="h-[70vh] w-full pb-4 -mx-3 px-3">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-2 sm:p-3">
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : freeMaterials.length === 0 ? (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              No free study materials found. Click "Add New" to create one.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {freeMaterials.map(material => (
              <MaterialCard 
                key={material.id}
                material={material}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FreeMaterialsTab;
