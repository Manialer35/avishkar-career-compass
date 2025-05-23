
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  name?: string; // Added name field
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
  const { session } = useAuth();

  // Memoize fetchMaterials to avoid recreating it on each render
  const fetchMaterials = useCallback(async () => {
    try {
      console.log("Fetching materials...");
      setLoading(true);
      
      // First check if the session is valid
      if (!session) {
        console.log("No active session, cannot fetch materials");
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
          price: item.price || 0
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
  }, [toast, session]);

  // Using useEffect to fetch materials when the component mounts or session changes
  useEffect(() => {
    if (session) {
      fetchMaterials();
    }
  }, [fetchMaterials, session]);

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(false);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!session) {
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
      price: activeTab === 'premium' ? 0 : undefined
    });
    setNewMaterial(true);
  };

  const handleSave = async () => {
    if (!editingMaterial) return;
    
    try {
      setSavingMaterial(true);
      console.log("Saving material:", editingMaterial);
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save materials",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      // Make sure price is set for premium materials
      if (editingMaterial.isPremium && (!editingMaterial.price || editingMaterial.price <= 0)) {
        toast({
          title: "Invalid price",
          description: "Premium materials must have a price greater than 0",
          variant: "destructive",
        });
        return;
      }

      // Make sure the title is defined
      if (!editingMaterial.title || editingMaterial.title.trim() === '') {
        toast({
          title: "Missing title",
          description: "Please provide a title for the material",
          variant: "destructive",
        });
        return;
      }

      // Fix: Prepare the material data with proper field names matching the database
      const materialData = {
        title: editingMaterial.title,
        name: editingMaterial.title, // Use title as name if not provided
        description: editingMaterial.description,
        downloadurl: editingMaterial.downloadUrl, // Note: lowercase 'url' to match DB column
        thumbnailurl: editingMaterial.thumbnailUrl || null, // Note: lowercase 'url' to match DB column
        ispremium: editingMaterial.isPremium, // Note: lowercase 'is' to match DB column
        price: editingMaterial.isPremium ? editingMaterial.price : 0 // Always set a price value
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
            price: data[0].price || 0
          };
          
          setMaterials([newItem, ...materials]);
          console.log("New material saved:", newItem);
          
          // Show success message
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

        // Update the materials list with the updated item
        setMaterials(materials.map(m => m.id === editingMaterial.id ? {
          ...m,
          title: editingMaterial.title,
          name: editingMaterial.title,
          description: editingMaterial.description,
          downloadUrl: editingMaterial.downloadUrl,
          thumbnailUrl: editingMaterial.thumbnailUrl,
          isPremium: editingMaterial.isPremium,
          price: editingMaterial.price || 0
        } : m));
        
        console.log("Material updated:", editingMaterial);
        
        // Show success message
        toast({
          title: "Material updated",
          description: "The study material has been updated successfully.",
          duration: 3000,
        });
      }
      
      // Reset the editing state
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
  
  // Get current materials for pagination
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
