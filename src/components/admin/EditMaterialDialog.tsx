
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFolders } from '@/hooks/useFolders';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  folder_id?: string;
  isUpcoming?: boolean;
}

interface EditMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  material: StudyMaterial | null;
  onMaterialChange: (material: StudyMaterial) => void;
  onSave: () => void;
  saving: boolean;
  isNew: boolean;
}

const EditMaterialDialog = ({
  isOpen,
  onClose,
  material,
  onMaterialChange,
  onSave,
  saving,
  isNew
}: EditMaterialDialogProps) => {
  const { folders } = useFolders();
  
  if (!material) return null;

  const relevantFolders = folders.filter(folder => folder.is_premium === material.isPremium);

  const handleInputChange = (field: keyof StudyMaterial, value: any) => {
    onMaterialChange({
      ...material,
      [field]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New Material' : 'Edit Material'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={material.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Material title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={material.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Material description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="folder">Folder (Optional)</Label>
            <Select 
              value={material.folder_id || "no-folder"} 
              onValueChange={(value) => handleInputChange('folder_id', value === 'no-folder' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-folder">No Folder</SelectItem>
                {relevantFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="downloadUrl">Download URL</Label>
            <Input
              id="downloadUrl"
              value={material.downloadUrl}
              onChange={(e) => handleInputChange('downloadUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
            <Input
              id="thumbnailUrl"
              value={material.thumbnailUrl || ''}
              onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPremium"
              checked={material.isPremium}
              onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
            />
            <Label htmlFor="isPremium">Premium Material</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isUpcoming"
              checked={material.isUpcoming || false}
              onCheckedChange={(checked) => handleInputChange('isUpcoming', checked)}
            />
            <Label htmlFor="isUpcoming">Upcoming Material</Label>
          </div>

          {material.isPremium && (
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={material.price || 0}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaterialDialog;
