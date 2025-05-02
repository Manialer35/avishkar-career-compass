
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBack: () => void;
}

export const ForgotPasswordForm = ({ email, setEmail, onBack }: ForgotPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
      
      onBack();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-academy-primary">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-academy-primary hover:bg-academy-primary/90"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Send reset link'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>
      </form>
    </div>
  );
};
