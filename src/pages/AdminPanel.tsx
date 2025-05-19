
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
import ClassRegistrationsTab from '@/components/admin/ClassRegistrationsTab';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';
import Pagination from '@/components/admin/classes/Pagination';

const AdminPanel = () => {
  const { 
    materials, 
    loading,
    activeTab, 
    setActiveTab,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    handleAddNew,
    handleEdit,
    handleDelete,
    handleSave,
    currentPage,
    totalPages,
    handlePageChange
  } = useAdminMaterials();
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-academy-primary">Admin Panel</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users" className="flex items-center">
            <Users size={16} className="mr-1" />
            Manage Users
          </Link>
        </Button>
      </div>
      
      <div className="w-full overflow-hidden">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-3 sm:mb-4 overflow-x-auto flex w-full sm:justify-start gap-1">
            <TabsTrigger value="free" className="whitespace-nowrap px-2 py-1 text-xs sm:text-sm">Free Materials</TabsTrigger>
            <TabsTrigger value="premium" className="whitespace-nowrap px-2 py-1 text-xs sm:text-sm">Premium Materials</TabsTrigger>
            <TabsTrigger value="videos" className="whitespace-nowrap px-2 py-1 text-xs sm:text-sm">Training Videos</TabsTrigger>
            <TabsTrigger value="images" className="whitespace-nowrap px-2 py-1 text-xs sm:text-sm">Images</TabsTrigger>
            <TabsTrigger value="registrations" className="whitespace-nowrap px-2 py-1 text-xs sm:text-sm">Class Registrations</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <TabsContent value="free" className="min-w-0 mt-0">
              <FreeMaterialsTab 
                materials={materials.filter(m => !m.isPremium)} 
                loading={loading}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <div className="mt-4">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="premium" className="min-w-0 mt-0">
              <PremiumMaterialsTab 
                materials={materials.filter(m => m.isPremium)} 
                loading={loading}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <div className="mt-4">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="min-w-0 mt-0">
              <VideosTab />
            </TabsContent>
            
            <TabsContent value="images" className="min-w-0 mt-0">
              <ImageManagementTab />
            </TabsContent>
            
            <TabsContent value="registrations" className="min-w-0 mt-0">
              <ClassRegistrationsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
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
