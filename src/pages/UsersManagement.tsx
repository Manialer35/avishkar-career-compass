
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import useUsers from '@/hooks/useUsers';
import UserTabs from '@/components/users/UserTabs';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    users, 
    loading, 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    userToDelete,
    setUserToDelete,
    confirmDeleteUser,
    handleDeleteUser
  } = useUsers(searchTerm);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">User Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => toast({
          title: "Coming Soon",
          description: "User invitation functionality will be available soon."
        })}>
          <UserPlus size={16} className="mr-2" />
          Invite User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTabs 
            users={users} 
            loading={loading} 
            onDeleteUser={confirmDeleteUser} 
          />
        </CardContent>
      </Card>
      
      <DeleteUserDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

// Import within the same file to avoid circular dependencies
import { UserPlus } from 'lucide-react';

export default UsersManagement;
