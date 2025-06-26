
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
      // Get user profiles and roles from database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          created_at
        `);

      if (profilesError) {
        throw profilesError;
      }
      
      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        throw rolesError;
      }
      
      // Get user emails (via admin functions)
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        throw usersError;
      }

      // Combine all the data
      const combinedData = profiles.map((profile: any) => {
        const role = roles.find((r: any) => r.user_id === profile.id);
        const user = users?.users.find((u: any) => u.id === profile.id);
        
        return {
          id: profile.id,
          email: user?.email || 'Email not available',
          role: role?.role || 'user',
          full_name: profile.full_name,
          created_at: profile.created_at
        };
      });

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
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete the user from auth.users
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
    handleDeleteUser,
    refreshUsers: fetchUsers
  };
};

export default useUsers;
