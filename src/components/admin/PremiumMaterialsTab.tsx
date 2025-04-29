
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MaterialCard from './MaterialCard';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  isPremium: boolean;
  price?: number;
}

interface PremiumMaterialsTabProps {
  materials: StudyMaterial[];
  onAddNew: () => void;
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: string) => void;
}

const PremiumMaterialsTab = ({ materials, onAddNew, onEdit, onDelete }: PremiumMaterialsTabProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Premium Study Materials</h2>
        <Button onClick={onAddNew}>
          <Plus size={16} className="mr-2" />
          Add New Material
        </Button>
      </div>
      
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
    </>
  );
};

export default PremiumMaterialsTab;
