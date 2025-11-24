import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Shield } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email().max(255);

export const AdminManagement: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAdmins, setPendingAdmins] = useState<string[]>([]);
  const { toast } = useToast();

  const addAdmin = async () => {
    const validation = emailSchema.safeParse(email.trim());
    if (!validation.success) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('promote_email_to_admin', {
        target_email: email.toLowerCase().trim()
      });

      if (error) throw error;

      toast({
        title: "Admin Added",
        description: data,
        duration: 3000,
      });

      if (data.includes('PENDING')) {
        setPendingAdmins(prev => [...prev, email.toLowerCase().trim()]);
      }

      setEmail('');
      loadPendingAdmins(); // Reload list
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAdmins = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_admin_emails');
      if (error) throw error;
      setPendingAdmins(data?.map((item: any) => item.email) || []);
    } catch (error) {
      console.error('Error loading pending admins:', error);
    }
  };

  React.useEffect(() => {
    loadPendingAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address (e.g., admin@example.com)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 transition-all focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={addAdmin} 
              disabled={loading}
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
          
          {pendingAdmins.length > 0 && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-medium mb-2">Pending Admin Emails:</h3>
              <div className="flex flex-wrap gap-2">
                {pendingAdmins.map((adminEmail) => (
                  <Badge key={adminEmail} variant="outline" className="flex items-center gap-1 transition-all">
                    <Mail className="h-3 w-3" />
                    {adminEmail}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These email addresses will automatically become admins when they sign up with Google.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};