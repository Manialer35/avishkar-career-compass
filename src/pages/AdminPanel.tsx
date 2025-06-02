
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, Video, Users, Calendar, Image, FileText, Shield } from 'lucide-react';
import FreeMaterialsTab from '@/components/admin/FreeMaterialsTab';
import PremiumMaterialsTab from '@/components/admin/PremiumMaterialsTab';
import VideosTab from '@/components/admin/VideosTab';
import EventsTab from '@/components/admin/EventsTab';
import ImageManagementTab from '@/components/admin/ImageManagementTab';
import ClassRegistrationsTab from '@/components/admin/ClassRegistrationsTab';
import AdminClassesManagement from '@/components/admin/AdminClassesManagement';
import EditMaterialDialog from '@/components/admin/EditMaterialDialog';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';

const AdminPanel = () => {
  const { session, userRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('free-materials');
  
  const {
    allMaterials,
    loading: materialsLoading,
    savingMaterial,
    editingMaterial,
    setEditingMaterial,
    newMaterial,
    setNewMaterial,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleSave,
    setActiveTab: setMaterialsActiveTab
  } = useAdminMaterials();

  // Update materials active tab when admin panel tab changes
  useEffect(() => {
    if (activeTab === 'free-materials') {
      setMaterialsActiveTab('free');
    } else if (activeTab === 'premium-materials') {
      setMaterialsActiveTab('premium');
    }
  }, [activeTab, setMaterialsActiveTab]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full max-w-4xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (userRole?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-academy-primary mr-3" />
        <h1 className="text-3xl font-bold text-academy-primary">Admin Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8">
          <TabsTrigger value="free-materials" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Free</span>
          </TabsTrigger>
          <TabsTrigger value="premium-materials" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Premium</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Registrations</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Images</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="free-materials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Free Study Materials Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FreeMaterialsTab 
                materials={allMaterials}
                loading={materialsLoading}
                onAddNew={() => {
                  setMaterialsActiveTab('free');
                  handleAddNew();
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium-materials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Premium Study Materials Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PremiumMaterialsTab 
                materials={allMaterials}
                loading={materialsLoading}
                onAddNew={() => {
                  setMaterialsActiveTab('premium');
                  handleAddNew();
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Training Videos Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideosTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classes Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminClassesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClassRegistrationsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageManagementTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingMaterial && (
        <EditMaterialDialog
          material={editingMaterial}
          isNew={newMaterial}
          onSave={handleSave}
          onClose={() => {
            setEditingMaterial(null);
            setNewMaterial(false);
          }}
          saving={savingMaterial}
        />
      )}
    </div>
  );
};

export default AdminPanel;
