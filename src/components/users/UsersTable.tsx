
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
import { Card, CardContent } from '@/components/ui/card';
import { User, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


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

const LoadingRow = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[180px]" /></TableCell>
    <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-[80px]" /></TableCell>
    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
  </TableRow>
);

const MobileUserCard = ({ user, onDeleteUser }: { user: UserData; onDeleteUser: (user: UserData) => void }) => (
  <Card className="mb-3">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{user.full_name || 'N/A'}</span>
            <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs">
              {user.role}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="text-red-500 hover:text-red-700 ml-3"
          onClick={() => onDeleteUser(user)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const UsersTable = ({ users, loading, onDeleteUser }: UsersTableProps) => {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop Loading */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(3).fill(0).map((_, i) => (
                <LoadingRow key={i} />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile Loading */}
        <div className="sm:hidden space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{user.full_name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="max-w-[200px] truncate">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                    {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDeleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        {users.map((user) => (
          <MobileUserCard 
            key={user.id} 
            user={user} 
            onDeleteUser={onDeleteUser} 
          />
        ))}
      </div>
    </div>
  );
};

export default UsersTable;
