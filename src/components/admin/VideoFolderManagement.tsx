
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash, Folder, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface TrainingVideoFolder {
  id: string;
  name: string;
  description: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

const VideoFolderManagement = () => {
  const [folders, setFolders] = useState<TrainingVideoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<TrainingVideoFolder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_premium: false
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_video_folders')
        .select('*')
        .order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (folder?: TrainingVideoFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFormData({
        name: folder.name,
        description: folder.description || '',
        is_premium: folder.is_premium
      });
    } else {
      setEditingFolder(null);
      setFormData({
        name: '',
        description: '',
        is_premium: false
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingFolder(null);
    setFormData({
      name: '',
      description: '',
      is_premium: false
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("You must be logged in to manage folders");
      }

      if (editingFolder) {
        // Update existing folder
        const { data, error } = await supabase
          .from('training_video_folders')
          .update({
            name: formData.name,
            description: formData.description,
            is_premium: formData.is_premium,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFolder.id)
          .select()
          .single();

        if (error) throw error;

        setFolders(folders.map(f => f.id === editingFolder.id ? data : f));
        
        toast({
          title: "Folder updated",
          description: "The folder has been successfully updated."
        });
      } else {
        // Create new folder
        const { data, error } = await supabase
          .from('training_video_folders')
          .insert({
            name: formData.name,
            description: formData.description,
            is_premium: formData.is_premium
          })
          .select()
          .single();

        if (error) throw error;

        setFolders([...folders, data]);
        
        toast({
          title: "Folder created",
          description: "The folder has been successfully created."
        });
      }

      closeDialog();
    } catch (error: any) {
      console.error("Error saving folder:", error);
      toast({
        title: editingFolder ? "Error updating folder" : "Error creating folder",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${name}"? Videos in this folder will become unorganized.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('training_video_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(folders.filter(f => f.id !== id));
      
      toast({
        title: "Folder deleted",
        description: "The folder has been successfully deleted."
      });
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading folders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-academy-primary">Video Folders</h3>
        <Button 
          onClick={() => openDialog()}
          className="bg-academy-primary hover:bg-academy-primary/90"
        >
          <Plus size={16} className="mr-2" />
          New Folder
        </Button>
      </div>

      {folders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map(folder => (
            <Card key={folder.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Folder size={20} className="text-academy-primary" />
                    <CardTitle className="text-base">{folder.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(folder)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(folder.id, folder.name)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {folder.description && (
                  <p className="text-sm text-gray-600 mb-2">{folder.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                  {folder.is_premium && (
                    <span className="bg-academy-red text-white px-2 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Folder size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Folders Yet</h3>
            <p className="text-gray-600 mb-6">
              Create folders to organize your training videos by topic or category.
            </p>
            <Button onClick={() => openDialog()}>
              <Plus size={16} className="mr-2" />
              Create First Folder
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Folder Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? "Edit Folder" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Police Bharti, Current Affairs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Optional description for this folder"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Input
                id="is_premium"
                name="is_premium"
                type="checkbox"
                checked={formData.is_premium}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="is_premium">Premium Folder (Paid Access Only)</Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-academy-primary hover:bg-academy-primary/90"
              >
                {saving 
                  ? (editingFolder ? "Updating..." : "Creating...") 
                  : (editingFolder ? "Update Folder" : "Create Folder")
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoFolderManagement;
