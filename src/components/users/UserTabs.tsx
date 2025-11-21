
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UsersTable from './UsersTable';

interface UserData {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

interface UserTabsProps {
  users: UserData[];
  loading: boolean;
  onDeleteUser: (user: UserData) => void;
}

const UserTabs = ({ users, loading, onDeleteUser }: UserTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Users</TabsTrigger>
        <TabsTrigger value="admin">Admins</TabsTrigger>
        <TabsTrigger value="user">Students</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <UsersTable 
          users={users} 
          loading={loading}
          onDeleteUser={onDeleteUser} 
        />
      </TabsContent>
      
      <TabsContent value="admin">
        <UsersTable 
          users={users.filter(user => user.role === 'admin')} 
          loading={loading}
          onDeleteUser={onDeleteUser} 
        />
      </TabsContent>
      
      <TabsContent value="user">
        <UsersTable 
          users={users.filter(user => user.role === 'user')} 
          loading={loading}
          onDeleteUser={onDeleteUser} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default UserTabs;
