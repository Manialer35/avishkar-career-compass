
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import FreeMaterialsTab from '@/components/admin/FreeMaterialsTab';
import PremiumMaterialsTab from '@/components/admin/PremiumMaterialsTab';
import VideosTab from '@/components/admin/VideosTab';
import EditMaterialDialog from '@/components/admin/EditMaterialDialog';
import ImageManagementTab from '@/components/admin/ImageManagementTab';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';

const AdminPanel = () => {
  const { 
    materials, 
    activeTab, 
    setActiveTab,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    handleAddNew,
    handleEdit,
    handleDelete,
    handleSave
  } = useAdminMaterials();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-academy-primary">Admin Panel</h1>
        <Button asChild variant="outline">
          <Link to="/admin/users" className="flex items-center">
            <Users size={16} className="mr-2" />
            Manage Users
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="free">Free Materials</TabsTrigger>
          <TabsTrigger value="premium">Premium Materials</TabsTrigger>
          <TabsTrigger value="videos">Training Videos</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free">
          <FreeMaterialsTab 
            materials={materials.filter(m => !m.isPremium)} 
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="premium">
          <PremiumMaterialsTab 
            materials={materials.filter(m => m.isPremium)} 
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
        
        <TabsContent value="images">
          <ImageManagementTab />
        </TabsContent>
      </Tabs>
      
      {editingMaterial && (
        <EditMaterialDialog
          material={editingMaterial}
          isNew={newMaterial}
          onSave={handleSave}
          onCancel={() => {
            setEditingMaterial(null);
            setNewMaterial(false);
          }}
          onChange={(field, value) => 
            setEditingMaterial({...editingMaterial, [field]: value})
          }
        />
      )}
    </div>
  );
};

export default AdminPanel;
