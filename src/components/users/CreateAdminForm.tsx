
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface CreateAdminFormProps {
  onComplete: () => void;
}

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).max(255),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
});

const CreateAdminForm = ({ onComplete }: CreateAdminFormProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validation = emailSchema.safeParse({ email, fullName });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the database function to promote email to admin
      const { data, error } = await supabase.rpc('promote_email_to_admin', {
        target_email: email.toLowerCase().trim()
      });
      
      if (error) throw error;
      
      toast({
        title: "Admin Created",
        description: data || "Admin privileges have been granted successfully",
        duration: 3000,
      });
      
      // Reset form
      setEmail('');
      setFullName('');
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="transition-all focus:ring-2 focus:ring-primary"
        />
        <p className="text-sm text-muted-foreground">
          Enter the email address of the user you want to make admin
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
          className="transition-all focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onComplete}
          className="transition-all hover:scale-105"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="transition-all hover:scale-105"
        >
          {loading ? 'Creating...' : 'Grant Admin Access'}
        </Button>
      </div>
    </form>
  );
};

export default CreateAdminForm;
