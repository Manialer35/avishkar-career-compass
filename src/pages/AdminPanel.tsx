
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, FileText, Users, ImageIcon, Clock } from 'lucide-react';
import FreeMaterialsTab from '@/components/admin/FreeMaterialsTab';
import PremiumMaterialsTab from '@/components/admin/PremiumMaterialsTab';
import UpcomingMaterialsTab from '@/components/admin/UpcomingMaterialsTab';
import VideosTab from '@/components/admin/VideosTab';
import EventsTab from '@/components/admin/EventsTab';
import ImageManagementTab from '@/components/admin/ImageManagementTab';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';
import EditMaterialDialog from '@/components/admin/EditMaterialDialog';
import AdminClassesManagement from '@/components/admin/AdminClassesManagement';

const AdminPanel = () => {
  const { session, userRole } = useAuth();
  const {
    materials,
    allMaterials,
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
  } = useAdminMaterials();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAddNewMaterial = (type: 'free' | 'premium' | 'upcoming') => {
    setEditingMaterial({
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      downloadUrl: '',
      isPremium: type === 'premium',
      price: type === 'premium' ? 0 : undefined,
      folder_id: undefined,
      isUpcoming: type === 'upcoming'
    });
    setNewMaterial(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-academy-primary mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage study materials, videos, events, and more</p>
      </div>

      <Tabs defaultValue="free-materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="free-materials" className="flex items-center gap-1 text-xs">
            <BookOpen size={14} />
            <span className="hidden sm:inline">Free</span>
          </TabsTrigger>
          <TabsTrigger value="premium-materials" className="flex items-center gap-1 text-xs">
            <FileText size={14} />
            <span className="hidden sm:inline">Premium</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming-materials" className="flex items-center gap-1 text-xs">
            <Clock size={14} />
            <span className="hidden sm:inline">Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-1 text-xs">
            <Video size={14} />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
            <Users size={14} />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-1 text-xs">
            <ImageIcon size={14} />
            <span className="hidden sm:inline">Images</span>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-4">
            <TabsContent value="free-materials" className="mt-0">
              <FreeMaterialsTab
                materials={allMaterials}
                loading={loading}
                onAddNew={() => handleAddNewMaterial('free')}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="premium-materials" className="mt-0">
              <PremiumMaterialsTab
                materials={allMaterials}
                loading={loading}
                onAddNew={() => handleAddNewMaterial('premium')}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="upcoming-materials" className="mt-0">
              <UpcomingMaterialsTab
                materials={allMaterials}
                loading={loading}
                onAddNew={() => handleAddNewMaterial('upcoming')}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              <VideosTab />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <EventsTab />
              <div className="mt-8">
                <AdminClassesManagement />
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <ImageManagementTab />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <EditMaterialDialog
        isOpen={!!editingMaterial}
        onClose={() => {
          setEditingMaterial(null);
          setNewMaterial(false);
        }}
        material={editingMaterial}
        onMaterialChange={setEditingMaterial}
        onSave={handleSave}
        saving={savingMaterial}
        isNew={newMaterial}
      />
    </div>
  );
};

export default AdminPanel;
