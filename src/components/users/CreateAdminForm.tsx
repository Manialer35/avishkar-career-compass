
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateAdminFormProps {
  onComplete: () => void;
}

const CreateAdminForm = ({ onComplete }: CreateAdminFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!phoneNumber || !fullName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must include country code (e.g., +918888769281)",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the database function to promote phone to admin
      const { data, error } = await supabase.rpc('promote_phone_to_admin', {
        target_phone: phoneNumber
      });
      
      if (error) throw error;
      
      toast({
        title: "Admin Created",
        description: data || "Admin privileges have been granted successfully",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+918888769281"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          Include country code (e.g., +91 for India)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Admin'}
        </Button>
      </div>
    </form>
  );
};

export default CreateAdminForm;
