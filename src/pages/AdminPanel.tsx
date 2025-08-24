
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Video, Users, Calendar, Image, FileText, Shield } from 'lucide-react';
import FreeMaterialsTab from '@/components/admin/FreeMaterialsTab';
import PremiumMaterialsTab from '@/components/admin/PremiumMaterialsTab';
import VideosTab from '@/components/admin/VideosTab';
import EventsTab from '@/components/admin/EventsTab';
import ImageManagementTab from '@/components/admin/ImageManagementTab';
import ClassRegistrationsTab from '@/components/admin/ClassRegistrationsTab';
import AdminClassesManagement from '@/components/admin/AdminClassesManagement';
import EditMaterialDialog from '@/components/admin/EditMaterialDialog';
import AdminNavigation from '@/components/AdminNavigation';
import { useAdminMaterials } from '@/hooks/useAdminMaterials';
import { useSecureAdmin } from '@/hooks/useSecureAdmin';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useSecureAdmin();
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

  useEffect(() => {
    if (activeTab === 'free-materials') {
      setMaterialsActiveTab('free');
    } else if (activeTab === 'premium-materials') {
      setMaterialsActiveTab('premium');
    }
  }, [activeTab, setMaterialsActiveTab]);

  const handleMaterialChange = (field: string, value: any) => {
    if (editingMaterial) {
      setEditingMaterial({
        ...editingMaterial,
        [field]: value
      });
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full max-w-4xl" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="h-screen flex flex-col">
        <div className="flex items-center px-4 py-8">
          <Shield className="h-8 w-8 text-academy-primary mr-3" />
          <h1 className="text-3xl font-bold text-academy-primary">Admin Panel</h1>
        </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8 mx-4">
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

          <div className="flex-1 overflow-hidden px-4">
            <TabsContent value="free-materials" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Free Study Materials Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
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
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="premium-materials" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Premium Study Materials Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
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
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Training Videos Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <VideosTab />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Events Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <EventsTab />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Classes Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <AdminClassesManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Class Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <ClassRegistrationsTab />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Image Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <ImageManagementTab />
                  </ScrollArea>
                </CardContent>
              </Card>
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
          onChange={handleMaterialChange}
          savingMaterial={savingMaterial}
        />
      )}
      </div>
    </div>
  );
};

export default AdminPanel;
