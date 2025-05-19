
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MaterialCard from './MaterialCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  
  return (
    <>
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
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 mt-3">
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
    </>
  );
};

export default FreeMaterialsTab;
