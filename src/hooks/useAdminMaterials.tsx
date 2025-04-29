
import { useState } from 'react';
import { useToast } from './use-toast';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  isPremium: boolean;
  price?: number;
}

export const useAdminMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([
    {
      id: '1',
      title: 'चालू घडामोडी',
      description: 'Latest current affairs and news updates in Marathi',
      downloadUrl: '#',
      isPremium: false
    },
    {
      id: '2',
      title: 'Daily टेस्ट पेपर',
      description: 'Daily test papers for one year subscription',
      downloadUrl: '#',
      isPremium: true,
      price: 99
    },
    // Add more initial materials as needed
  ]);
  
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('free');
  const { toast } = useToast();

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(false);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast({
      title: "Material deleted",
      description: "The study material has been deleted successfully."
    });
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

  const handleSave = () => {
    if (!editingMaterial) return;
    
    if (newMaterial) {
      setMaterials([...materials, editingMaterial]);
    } else {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
    }
    
    setEditingMaterial(null);
    setNewMaterial(false);
    
    toast({
      title: "Changes saved",
      description: "The study material has been updated successfully."
    });
  };

  return {
    materials,
    setMaterials,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    activeTab,
    setActiveTab,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleSave
  };
};
