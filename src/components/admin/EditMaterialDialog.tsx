
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  material: StudyMaterial | null;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
  savingMaterial: boolean;
}

const EditMaterialDialog = ({
  material,
  isNew,
  onSave,
  onCancel,
  onChange,
  savingMaterial
}: EditMaterialDialogProps) => {
  const { folders } = useFolders();

  if (!material) return null;

  const relevantFolders = folders.filter(folder => folder.is_premium === material.isPremium);

  return (
    <Dialog open={!!material} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New Study Material' : 'Edit Study Material'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={material.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Material title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={material.folder_id || ''}
                onValueChange={(value) => onChange('folder_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Folder</SelectItem>
                  {relevantFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={material.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Material description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downloadUrl">Download URL {!material.isUpcoming && '*'}</Label>
            <Input
              id="downloadUrl"
              value={material.downloadUrl}
              onChange={(e) => onChange('downloadUrl', e.target.value)}
              placeholder="https://example.com/file.pdf"
              disabled={material.isUpcoming}
            />
            {material.isUpcoming && (
              <p className="text-sm text-gray-500">Download URL is not required for upcoming materials</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={material.thumbnailUrl || ''}
              onChange={(e) => onChange('thumbnailUrl', e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPremium"
              checked={material.isPremium}
              onCheckedChange={(checked) => onChange('isPremium', checked)}
            />
            <Label htmlFor="isPremium">Premium Material</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isUpcoming"
              checked={material.isUpcoming || false}
              onCheckedChange={(checked) => onChange('isUpcoming', checked)}
            />
            <Label htmlFor="isUpcoming">Coming Soon Material</Label>
          </div>

          {material.isPremium && !material.isUpcoming && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={material.price || ''}
                onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {material.isPremium && material.isUpcoming && (
            <div className="space-y-2">
              <Label htmlFor="price">Expected Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={material.price || ''}
                onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-gray-500">Optional: Set expected price for upcoming premium materials</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={savingMaterial}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={savingMaterial}>
              {savingMaterial ? 'Saving...' : (isNew ? 'Create' : 'Update')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaterialDialog;
