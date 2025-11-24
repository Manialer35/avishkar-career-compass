
import { useState } from 'react';
import { Search, UserPlus, UserPlusIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import useUsers from '@/hooks/useUsers';
import UserTabs from '@/components/users/UserTabs';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import CreateAdminForm from '@/components/users/CreateAdminForm';
import AdminNavigation from '@/components/AdminNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSecureAdmin } from '@/hooks/useSecureAdmin';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useSecureAdmin();
  
  const { 
    users, 
    loading, 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    userToDelete,
    setUserToDelete,
    confirmDeleteUser,
    handleDeleteUser,
    refreshUsers
  } = useUsers(searchTerm);

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const adminUsers = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role === 'user');
  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <AdminNavigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-scale-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">Manage users, roles, and access permissions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="order-2 sm:order-1 transition-all hover:scale-105"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshUsers}
              disabled={loading}
              className="order-1 sm:order-2 transition-all hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Badge variant="secondary" className="transition-all">{totalUsers}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold">{adminUsers.length}</p>
                </div>
                <Badge variant="default" className="transition-all">{adminUsers.length}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold">{regularUsers.length}</p>
                </div>
                <Badge variant="outline" className="transition-all">{regularUsers.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search users by name or phone..."
                className="pl-10 transition-all focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Users Table */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users</span>
              {loading && (
                <Badge variant="secondary" className="animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UserTabs 
              users={users} 
              loading={loading} 
              onDeleteUser={confirmDeleteUser} 
            />
          </CardContent>
        </Card>
        
        {/* Create Admin Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle>Create Admin User</DialogTitle>
            </DialogHeader>
            <CreateAdminForm onComplete={() => {
              setIsCreateDialogOpen(false);
              refreshUsers();
            }} />
          </DialogContent>
        </Dialog>
        
        {/* Delete User Dialog */}
        <DeleteUserDialog 
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDeleteUser}
        />
      </div>
    </div>
  );
};

export default UsersManagement;
