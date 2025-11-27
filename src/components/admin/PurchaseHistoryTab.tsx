import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Search, Download, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface PurchaseRecord {
  id: string;
  user_id: string;
  material_id: string;
  amount: number;
  payment_id: string | null;
  purchased_at: string;
  expires_at: string | null;
  material_name?: string;
  user_email?: string;
}

interface MaterialPurchase {
  id: string;
  user_id: string | null;
  material_id: string | null;
  amount: number;
  payment_id: string | null;
  payment_status: string | null;
  purchased_at: string;
  user_name: string;
  user_email: string;
}

const PurchaseHistoryTab = () => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [materialPurchases, setMaterialPurchases] = useState<MaterialPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      // Fetch from user_purchases table
      const { data: userPurchasesData, error: userPurchasesError } = await supabase
        .from('user_purchases')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (userPurchasesError) throw userPurchasesError;

      // Fetch from material_purchases table
      const { data: materialPurchasesData, error: materialPurchasesError } = await supabase
        .from('material_purchases')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (materialPurchasesError) throw materialPurchasesError;

      // Fetch study materials for names
      const { data: materials } = await supabase
        .from('study_materials')
        .select('id, name, title');

      const materialsMap = new Map(materials?.map(m => [m.id, m.title || m.name]) || []);

      // Enrich user_purchases with material names
      const enrichedPurchases = (userPurchasesData || []).map(p => ({
        ...p,
        material_name: materialsMap.get(p.material_id) || 'Unknown Material'
      }));

      setPurchases(enrichedPurchases);
      setMaterialPurchases(materialPurchasesData || []);

      // Calculate total revenue
      const userPurchasesTotal = enrichedPurchases.reduce((sum, p) => sum + Number(p.amount), 0);
      const materialPurchasesTotal = (materialPurchasesData || []).reduce((sum, p) => sum + Number(p.amount), 0);
      setTotalRevenue(userPurchasesTotal + materialPurchasesTotal);

    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter(p => 
    p.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterialPurchases = materialPurchases.filter(p =>
    p.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Date', 'User Email', 'Material', 'Amount', 'Payment ID', 'Status'];
    const rows = materialPurchases.map(p => [
      format(new Date(p.purchased_at), 'yyyy-MM-dd HH:mm'),
      p.user_email,
      p.material_id || 'N/A',
      p.amount,
      p.payment_id || 'N/A',
      p.payment_status || 'completed'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <IndianRupee className="h-5 w-5" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-800 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-700 text-sm font-medium">User Purchases</div>
          <p className="text-2xl font-bold text-blue-800 mt-1">{purchases.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-700 text-sm font-medium">Material Purchases</div>
          <p className="text-2xl font-bold text-purple-800 mt-1">{materialPurchases.length}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, email, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPurchases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Material Purchases Table */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Purchase Records</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterialPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No purchase records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterialPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(purchase.purchased_at), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{purchase.user_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{purchase.user_email}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹{Number(purchase.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-mono">{purchase.payment_id || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {purchase.payment_status || 'completed'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Purchases Table */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">User Access Records</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No user access records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(purchase.purchased_at), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs font-mono truncate max-w-[120px]" title={purchase.user_id}>
                      {purchase.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={purchase.material_name}>
                      {purchase.material_name}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">₹{Number(purchase.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-mono">{purchase.payment_id || '-'}</TableCell>
                    <TableCell>
                      {purchase.expires_at ? (
                        <span className={new Date(purchase.expires_at) < new Date() ? 'text-red-500' : 'text-green-600'}>
                          {format(new Date(purchase.expires_at), 'dd MMM yyyy')}
                        </span>
                      ) : (
                        <Badge variant="outline">Lifetime</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistoryTab;
