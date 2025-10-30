import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Phone, Shield } from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAdmins, setPendingAdmins] = useState<string[]>([]);
  const { toast } = useToast();

  const addAdmin = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('promote_phone_to_admin', {
        target_phone: phoneNumber
      });

      if (error) throw error;

      toast({
        title: "Admin Added",
        description: data,
      });

      if (data.includes('PENDING')) {
        setPendingAdmins(prev => [...prev, phoneNumber]);
      }

      setPhoneNumber('');
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAdmins = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_admins');
      if (error) throw error;
      setPendingAdmins(data?.map((item: any) => item.phone_number) || []);
    } catch (error) {
      console.error('Error loading pending admins:', error);
    }
  };

  React.useEffect(() => {
    loadPendingAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number (e.g., +918888769281)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={addAdmin} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
          
          {pendingAdmins.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Pending Admin Phone Numbers:</h3>
              <div className="flex flex-wrap gap-2">
                {pendingAdmins.map((phone) => (
                  <Badge key={phone} variant="outline" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {phone}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These phone numbers will automatically become admins when they sign up.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};