
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Upload, X } from 'lucide-react';
import { useState, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string | number | boolean) => void;
}

const EditMaterialDialog = ({ 
  material, 
  isNew, 
  onSave, 
  onCancel,
  onChange
}: EditMaterialDialogProps) => {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(material.thumbnailUrl || null);
  const { toast } = useToast();
  
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (thumbnail) {
      setUploading(true);
      try {
        const fileName = `material-${material.id}-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('materials')
          .upload(fileName, thumbnail, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          throw error;
        }
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(data.path);
          
        onChange('thumbnailUrl', publicUrlData.publicUrl);
      } catch (error: any) {
        toast({
          title: "Error uploading thumbnail",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
    onSave();
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setPreviewUrl(null);
    onChange('thumbnailUrl', '');
  };

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
          
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select 
              value={material.isPremium ? "premium" : "free"} 
              onValueChange={(value) => onChange('isPremium', value === "premium")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail</label>
            {previewUrl ? (
              <div className="relative mt-1 mb-2">
                <img 
                  src={previewUrl} 
                  alt="Material thumbnail preview" 
                  className="w-full h-40 object-cover rounded-md border border-gray-200"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-white/90 rounded-full text-blue-500"
                  onClick={removeThumbnail}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-1 text-sm text-gray-500">
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-500 hover:underline">
                      Upload a thumbnail
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {material.isPremium && (
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <Input 
                type="number"
                value={material.price || 0} 
                onChange={(e) => onChange('price', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={uploading}>
            <Save size={16} className="mr-2" /> 
            {uploading ? 'Uploading...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialDialog;
