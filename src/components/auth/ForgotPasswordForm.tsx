
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/Icons';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Phone auth doesn't have password reset functionality
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Phone Authentication",
      description: "With phone authentication, you can simply log in with a new OTP if you lose access.",
    });
    onBack();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            With phone authentication, you don't need to reset passwords. 
            Simply sign in with your phone number and request a new OTP.
          </p>
          
          <Button onClick={onBack} className="w-full">
            Back to Sign In
          </Button>
        </div>
    </div>
  );
};

export default ForgotPasswordForm;
