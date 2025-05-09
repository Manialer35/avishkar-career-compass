
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Trash } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClassRegistration {
  id: string;
  created_at: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_address: string;
  class_title: string;
  class_date: string;
  class_id: string;
}

interface ClassRegistrationsTabProps {
  // You can add props as needed
}

const ClassRegistrationsTab = ({}: ClassRegistrationsTabProps) => {
  const [registrations, setRegistrations] = useState<ClassRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('class_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Error fetching class registrations:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load class registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('class_registrations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state to remove the deleted registration
      setRegistrations(registrations.filter((reg) => reg.id !== id));
      
      toast({
        title: 'Success',
        description: 'Registration deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting registration:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete registration',
        variant: 'destructive',
      });
    }
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.class_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPP');
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Registrations</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No registrations found matching your search'
              : 'No class registrations yet'}
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Class Date</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.student_name}</TableCell>
                  <TableCell>{registration.student_email}</TableCell>
                  <TableCell>{registration.student_phone}</TableCell>
                  <TableCell>{registration.class_title}</TableCell>
                  <TableCell>{formatDate(registration.class_date)}</TableCell>
                  <TableCell>{formatDate(registration.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteRegistration(registration.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClassRegistrationsTab;
