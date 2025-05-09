
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Free Study Materials</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage study materials available for free download
          </p>
        </div>
        <Button onClick={onAddNew} className="whitespace-nowrap">
          <Plus size={16} className="mr-2" />
          Add New Material
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : freeMaterials.length === 0 ? (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No free study materials found. Click "Add New Material" to create one.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
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
