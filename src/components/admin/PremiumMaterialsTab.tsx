
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MaterialCard from './MaterialCard';
import { Skeleton } from '@/components/ui/skeleton';

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
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Premium Study Materials</h2>
        <Button onClick={onAddNew}>
          <Plus size={16} className="mr-2" />
          Add New Material
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No premium study materials found. Click "Add New Material" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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
    </>
  );
};

export default PremiumMaterialsTab;
