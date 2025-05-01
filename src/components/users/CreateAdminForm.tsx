
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CreateAdminFormProps {
  onComplete: () => void;
}

const CreateAdminForm = ({ onComplete }: CreateAdminFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { createAdminUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await createAdminUser(email, password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Admin created",
        description: `Admin user ${email} has been created successfully.`
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error creating admin",
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
