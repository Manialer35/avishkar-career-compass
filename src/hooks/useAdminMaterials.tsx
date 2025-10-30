
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  name?: string;
  folder_id?: string;
  isUpcoming?: boolean;
}

export const useAdminMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('free');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaterials = useCallback(async () => {
    try {
      console.log("Fetching materials...");
      setLoading(true);
      
      if (!user) {
        console.log("No active user, cannot fetch materials");
        toast({
          title: "Authentication Required",
          description: "Please log in to access admin features",
          variant: "destructive",
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
        const formattedMaterials = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name,
          description: item.description || "",
          downloadUrl: item.downloadurl || "",
          thumbnailUrl: item.thumbnailurl || undefined,
          isPremium: item.ispremium || false,
          price: item.price || 0,
          folder_id: item.folder_id || undefined,
          isUpcoming: item.is_upcoming || false
        }));
        
        setMaterials(formattedMaterials);
        console.log("Materials set:", formattedMaterials.length);
      }
    } catch (error: any) {
      console.error("Error in fetchMaterials:", error);
      toast({
        title: "Error fetching materials",
        description: error.message || "Could not load study materials",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [fetchMaterials, user]);

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(false);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to delete materials",
          variant: "destructive",
        });
        return;
      }
      
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
        description: "The study material has been deleted successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting material",
        description: error.message || "Could not delete the material",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddNew = () => {
    setEditingMaterial({
      id: `new-${Date.now()}`,
      title: '',
      name: '', 
      description: '',
      downloadUrl: '',
      isPremium: activeTab === 'premium',
      price: activeTab === 'premium' ? 0 : undefined,
      folder_id: undefined,
      isUpcoming: false
    });
    setNewMaterial(true);
  };

  const handleSave = async () => {
    if (!editingMaterial) return;
    
    try {
      setSavingMaterial(true);
      console.log("Saving material:", editingMaterial);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save materials",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      if (editingMaterial.isPremium && !editingMaterial.isUpcoming && (!editingMaterial.price || editingMaterial.price <= 0)) {
        toast({
          title: "Invalid price",
          description: "Premium materials must have a price greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (!editingMaterial.title || editingMaterial.title.trim() === '') {
        toast({
          title: "Missing title",
          description: "Please provide a title for the material",
          variant: "destructive",
        });
        return;
      }

      if (!editingMaterial.isUpcoming && (!editingMaterial.downloadUrl || editingMaterial.downloadUrl.trim() === '')) {
        toast({
          title: "Missing download URL",
          description: "Please provide a download URL for available materials",
          variant: "destructive",
        });
        return;
      }

      const materialData = {
        title: editingMaterial.title,
        name: editingMaterial.title,
        description: editingMaterial.description,
        downloadurl: editingMaterial.isUpcoming ? null : editingMaterial.downloadUrl,
        thumbnailurl: editingMaterial.thumbnailUrl || null,
        ispremium: editingMaterial.isPremium,
        price: editingMaterial.isPremium ? editingMaterial.price : 0,
        folder_id: editingMaterial.folder_id || null,
        is_upcoming: editingMaterial.isUpcoming || false
      };

      if (newMaterial) {
        console.log("Inserting new material with data:", materialData);
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
            title: data[0].title || data[0].name,
            name: data[0].name,
            description: data[0].description || "",
            downloadUrl: data[0].downloadurl || "",
            thumbnailUrl: data[0].thumbnailurl || undefined,
            isPremium: data[0].ispremium || false,
            price: data[0].price || 0,
            folder_id: data[0].folder_id || undefined,
            isUpcoming: data[0].is_upcoming || false
          };
          
          setMaterials([newItem, ...materials]);
          console.log("New material saved:", newItem);
          
          toast({
            title: "Material added",
            description: "The new study material has been created successfully.",
            duration: 3000,
          });
        }
      } else {
        console.log("Updating existing material with data:", materialData);
        const { error } = await supabase
          .from('study_materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) {
          console.error("Error updating material:", error);
          throw error;
        }

        setMaterials(materials.map(m => m.id === editingMaterial.id ? {
          ...m,
          title: editingMaterial.title,
          name: editingMaterial.title,
          description: editingMaterial.description,
          downloadUrl: editingMaterial.isUpcoming ? '' : editingMaterial.downloadUrl,
          thumbnailUrl: editingMaterial.thumbnailUrl,
          isPremium: editingMaterial.isPremium,
          price: editingMaterial.price || 0,
          folder_id: editingMaterial.folder_id,
          isUpcoming: editingMaterial.isUpcoming || false
        } : m));
        
        console.log("Material updated:", editingMaterial);
        
        toast({
          title: "Material updated",
          description: "The study material has been updated successfully.",
          duration: 3000,
        });
      }
      
      setEditingMaterial(null);
      setNewMaterial(false);
      
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error saving material",
        description: error.message || "Could not save the study material",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSavingMaterial(false);
    }
  };
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredMaterials = materials.filter(m => 
    (activeTab === 'free' && !m.isPremium) || (activeTab === 'premium' && m.isPremium)
  );
  const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    materials: currentMaterials,
    allMaterials: materials,
    setMaterials,
    loading,
    savingMaterial,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    activeTab,
    setActiveTab,
    currentPage,
    totalPages,
    handlePageChange,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleSave,
    fetchMaterials
  };
};
