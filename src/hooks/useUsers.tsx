
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
      // Use the safe function to get users with roles
      const { data: usersData, error } = await supabase
        .rpc('get_users_with_roles');

      if (error) {
        throw error;
      }

      // Map the data to match expected interface
      const combinedData = (usersData || []).map((user: any) => ({
        id: user.id,
        email: user.phone_number || 'No phone available',
        role: user.role || 'user',
        full_name: user.full_name,
        created_at: user.created_at
      }));

      setUsers(combinedData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
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

    // Set up realtime subscription
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete user profile and role (cascade delete)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
      
      if (error) throw error;
      
      // Update UI
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: "User deleted",
        description: `${userToDelete.full_name || 'User'} has been deleted successfully.`,
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
    handleDeleteUser,
    refreshUsers: fetchUsers
  };
};

export default useUsers;
