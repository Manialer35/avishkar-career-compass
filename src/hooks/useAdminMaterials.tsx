
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

export const useAdminMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('free');
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      console.log("Fetching materials...");
      setLoading(true);
      
      // First check if the session is valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching materials:", error);
        throw error;
      }

      if (data) {
        console.log("Materials fetched successfully:", data.length);
        setMaterials(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          downloadUrl: item.downloadurl,
          thumbnailUrl: item.thumbnailurl || undefined,
          isPremium: item.ispremium,
          price: item.price || undefined
        })));
      }
    } catch (error: any) {
      console.error("Error in fetchMaterials:", error);
      toast({
        title: "Error fetching materials",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMaterials(materials.filter(m => m.id !== id));
      toast({
        title: "Material deleted",
        description: "The study material has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting material",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setEditingMaterial({
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      downloadUrl: '',
      isPremium: activeTab === 'premium',
      price: activeTab === 'premium' ? 0 : undefined
    });
    setNewMaterial(true);
  };

  const handleSave = async () => {
    if (!editingMaterial) return;
    
    try {
      console.log("Saving material:", editingMaterial);
      
      // First check if session is valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        return;
      }
      
      const materialData = {
        title: editingMaterial.title,
        description: editingMaterial.description,
        downloadurl: editingMaterial.downloadUrl,
        thumbnailurl: editingMaterial.thumbnailUrl || null,
        ispremium: editingMaterial.isPremium,
        price: editingMaterial.isPremium ? editingMaterial.price : null
      };

      if (newMaterial) {
        const { data, error } = await supabase
          .from('study_materials')
          .insert(materialData)
          .select();

        if (error) {
          console.error("Error inserting material:", error);
          throw error;
        }

        if (data && data[0]) {
          const newItem: StudyMaterial = {
            id: data[0].id,
            title: data[0].title,
            description: data[0].description,
            downloadUrl: data[0].downloadurl,
            thumbnailUrl: data[0].thumbnailurl || undefined,
            isPremium: data[0].ispremium,
            price: data[0].price || undefined
          };
          
          setMaterials([newItem, ...materials]);
          console.log("New material saved:", newItem);
        }
      } else {
        const { error } = await supabase
          .from('study_materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) {
          console.error("Error updating material:", error);
          throw error;
        }

        setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
        console.log("Material updated:", editingMaterial);
      }
      
      setEditingMaterial(null);
      setNewMaterial(false);
      
      toast({
        title: "Changes saved",
        description: "The study material has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error saving material",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    materials,
    setMaterials,
    loading,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    activeTab,
    setActiveTab,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleSave,
    fetchMaterials
  };
};
