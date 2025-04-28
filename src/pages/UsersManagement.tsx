
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user data from auth.users via the profiles and user_roles tables
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          created_at,
          user_roles!inner (role)
        `);

      if (error) {
        throw error;
      }

      // Fetch email addresses (requires admin access via edge function in a real app)
      // This is simplified for demo purposes
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Combine the data
      const combinedData = data.map((profile: any) => {
        const authUser = authData?.users.find((user: any) => user.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Email not available',
          role: profile.user_roles.role,
          full_name: profile.full_name,
          created_at: profile.created_at
        };
      });

      setUsers(combinedData);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete the user
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      
      if (error) throw error;
      
      // Update UI
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: "User deleted",
        description: `${userToDelete.email || 'User'} has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const confirmDeleteUser = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="user">Students</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <UsersTable 
                users={filteredUsers} 
                loading={loading}
                onDeleteUser={confirmDeleteUser} 
              />
            </TabsContent>
            
            <TabsContent value="admin">
              <UsersTable 
                users={filteredUsers.filter(user => user.role === 'admin')} 
                loading={loading}
                onDeleteUser={confirmDeleteUser} 
              />
            </TabsContent>
            
            <TabsContent value="user">
              <UsersTable 
                users={filteredUsers.filter(user => user.role === 'user')} 
                loading={loading}
                onDeleteUser={confirmDeleteUser} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the user account
            and remove their data from our servers.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface UsersTableProps {
  users: UserData[];
  loading: boolean;
  onDeleteUser: (user: UserData) => void;
}

const UsersTable = ({ users, loading, onDeleteUser }: UsersTableProps) => {
  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }
  
  if (users.length === 0) {
    return <div className="text-center py-4">No users found</div>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                {user.full_name || 'N/A'}
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="icon" 
                className="text-red-500 hover:text-red-700"
                onClick={() => onDeleteUser(user)}
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersManagement;
