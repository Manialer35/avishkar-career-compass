
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  isPremium: boolean;
  price?: number;
}

interface EditMaterialDialogProps {
  material: StudyMaterial;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string | number) => void;
}

const EditMaterialDialog = ({ 
  material, 
  isNew, 
  onSave, 
  onCancel,
  onChange
}: EditMaterialDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {isNew ? 'Add New Material' : 'Edit Material'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input 
              value={material.title} 
              onChange={(e) => onChange('title', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea 
              value={material.description} 
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Download URL</label>
            <Input 
              value={material.downloadUrl} 
              onChange={(e) => onChange('downloadUrl', e.target.value)}
            />
          </div>
          
          {material.isPremium && (
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <Input 
                type="number"
                value={material.price} 
                onChange={(e) => onChange('price', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save size={16} className="mr-2" /> 
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialDialog;
