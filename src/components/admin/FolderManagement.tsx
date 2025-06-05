
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Plus, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterialFolder {
  id: string;
  name: string;
  description?: string;
  is_premium: boolean;
  created_at: string;
  materialCount?: number;
}

interface FolderManagementProps {
  isPremium: boolean;
  folders: StudyMaterialFolder[];
  onFoldersChange: () => void;
}

const FolderManagement = ({ isPremium, folders, onFoldersChange }: FolderManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<StudyMaterialFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const filteredFolders = folders.filter(folder => folder.is_premium === isPremium);

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Validation Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingFolder) {
        const { error } = await supabase
          .from('study_material_folders')
          .update({
            name: folderName,
            description: folderDescription || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFolder.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Folder updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('study_material_folders')
          .insert({
            name: folderName,
            description: folderDescription || null,
            is_premium: isPremium
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingFolder(null);
      setFolderName('');
      setFolderDescription('');
      onFoldersChange();
    } catch (error: any) {
      console.error('Error saving folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save folder",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? Materials in this folder will be moved to "No Folder".')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('study_material_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });

      onFoldersChange();
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (folder?: StudyMaterialFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
      setFolderDescription(folder.description || '');
    } else {
      setEditingFolder(null);
      setFolderName('');
      setFolderDescription('');
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {isPremium ? 'Premium' : 'Free'} Folders
        </h3>
        <Button
          onClick={() => openEditDialog()}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Folder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Folder size={18} className={isPremium ? 'text-academy-red' : 'text-academy-primary'} />
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => openEditDialog(folder)}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    <Trash size={12} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {folder.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {folder.description}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {folder.materialCount || 0} materials
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? 'Edit Folder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder="Enter folder description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFolder}
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingFolder ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderManagement;
