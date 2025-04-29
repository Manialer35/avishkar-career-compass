
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

const useUsers = (searchTerm: string = '') => {
  const [users, setUsers] = useState<UserData[]>([]);
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

  return {
    users: filteredUsers,
    loading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    userToDelete,
    setUserToDelete,
    confirmDeleteUser,
    handleDeleteUser
  };
};

export default useUsers;
