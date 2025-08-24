
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Trash2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

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

export default UsersTable;
