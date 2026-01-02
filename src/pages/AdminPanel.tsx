
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Book, Video, Users, Calendar, Image, FileText, Shield, ShoppingCart } from 'lucide-react';
import FreeMaterialsTab from '@/components/admin/FreeMaterialsTab';
import PremiumMaterialsTab from '@/components/admin/PremiumMaterialsTab';
import VideosTab from '@/components/admin/VideosTab';
import EventsTab from '@/components/admin/EventsTab';
import ImageManagementTab from '@/components/admin/ImageManagementTab';
import ClassRegistrationsTab from '@/components/admin/ClassRegistrationsTab';
import AdminClassesManagement from '@/components/admin/AdminClassesManagement';
import EditMaterialDialog from '@/components/admin/EditMaterialDialog';
import AdminNavigation from '@/components/AdminNavigation';
import PurchaseHistoryTab from '@/components/admin/PurchaseHistoryTab';
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
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 px-2">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs sm:text-sm text-gray-600">Manage your academy content and settings</p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
          {/* Tab Navigation - Mobile optimized with native scroll */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto touch-pan-x scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <TabsList className="flex h-12 w-max bg-white p-1 space-x-1">
                  <TabsTrigger 
                    value="free-materials" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Book className="h-4 w-4" />
                    <span className="hidden sm:inline">Free Materials</span>
                    <span className="sm:hidden">Free</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="premium-materials" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Premium Materials</span>
                    <span className="sm:hidden">Premium</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="events" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="classes" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Users className="h-4 w-4" />
                    <span>Classes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="registrations" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrations</span>
                    <span className="sm:hidden">Reg.</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="images" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    <Image className="h-4 w-4" />
                    <span>Images</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="purchases" 
                    className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 min-w-fit whitespace-nowrap data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Purchases</span>
                    <span className="sm:hidden">Sales</span>
                  </TabsTrigger>
                </TabsList>
            </div>
          </div>

          {/* Tab Content - Remove fixed heights for proper mobile scrolling */}
          <div className="pb-20">
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
                <CardContent className="p-0 sm:p-6">
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

            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Purchase History & Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PurchaseHistoryTab />
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
  );
};

export default AdminPanel;
