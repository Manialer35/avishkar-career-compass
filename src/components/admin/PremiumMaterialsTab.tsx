
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MaterialCard from './MaterialCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useRef, useEffect } from 'react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

interface PremiumMaterialsTabProps {
  materials: StudyMaterial[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: string) => void;
}

const PremiumMaterialsTab = ({ materials, loading, onAddNew, onEdit, onDelete }: PremiumMaterialsTabProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Ensure the container is scrollable on mobile devices
    if (containerRef.current) {
      containerRef.current.style.webkitOverflowScrolling = 'touch';
    }
  }, []);
  
  return (
    <div className="overflow-hidden" ref={containerRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Premium Study Materials</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage premium study materials for purchase
          </p>
        </div>
        <Button onClick={onAddNew} size="sm" className="whitespace-nowrap h-8">
          <Plus size={14} className="mr-1" />
          Add New
        </Button>
      </div>
      
      <div className="overflow-y-auto max-h-[70vh] pb-4 -mx-3 px-3">
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
        ) : materials.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-500">No premium study materials found. Click "Add New" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-3">
            {materials.map(material => (
              <MaterialCard 
                key={material.id}
                material={material}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumMaterialsTab;
