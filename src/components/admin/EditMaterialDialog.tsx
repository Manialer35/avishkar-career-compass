
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2 } from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

interface EditMaterialDialogProps {
  material: StudyMaterial;
  isNew: boolean;
  savingMaterial?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
}

const EditMaterialDialog = ({ 
  material, 
  isNew,
  savingMaterial = false,
  onSave, 
  onCancel, 
  onChange 
}: EditMaterialDialogProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!material.title?.trim()) {
      errors.title = "Title is required";
    }
    
    if (material.isPremium && (!material.price || material.price <= 0)) {
      errors.price = "Price must be greater than 0 for premium materials";
    }
    
    if (!material.downloadUrl?.trim()) {
      errors.downloadUrl = "Download URL is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New Study Material' : 'Edit Study Material'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <div className="col-span-3">
              <Input
                id="title"
                value={material.title || ''}
                onChange={(e) => onChange('title', e.target.value)}
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={material.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="downloadUrl" className="text-right">
              Download URL
            </Label>
            <div className="col-span-3">
              <Input
                id="downloadUrl"
                value={material.downloadUrl || ''}
                onChange={(e) => onChange('downloadUrl', e.target.value)}
                placeholder="https://"
                className={validationErrors.downloadUrl ? "border-red-500" : ""}
              />
              {validationErrors.downloadUrl && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.downloadUrl}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnailUrl" className="text-right">
              Thumbnail URL
            </Label>
            <Input
              id="thumbnailUrl"
              value={material.thumbnailUrl || ''}
              onChange={(e) => onChange('thumbnailUrl', e.target.value)}
              placeholder="https://"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPremium" className="text-right">
              Premium
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="isPremium"
                checked={material.isPremium || false}
                onCheckedChange={(checked) => onChange('isPremium', checked)}
              />
              <Label htmlFor="isPremium">
                {material.isPremium ? 'Yes' : 'No'}
              </Label>
            </div>
          </div>
          
          {material.isPremium && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="price"
                  type="number"
                  value={material.price || ''}
                  onChange={(e) => onChange('price', parseFloat(e.target.value))}
                  placeholder="0.00"
                  className={validationErrors.price ? "border-red-500" : ""}
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={savingMaterial}>
            {savingMaterial ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isNew ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaterialDialog;
