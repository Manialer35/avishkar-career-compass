
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/Icons';
import ForgotPasswordForm from './ForgotPasswordForm';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validateInputs = () => {
    if (!email || !email.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return false;
    }

    if (!password || password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with:', { email });
      const result = await signIn(email, password);
      console.log('Sign in result:', result);
      
      toast({
        title: 'Success',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      console.log('Attempting to sign up with:', { email });
      await signUp(email, password);
      toast({
        title: 'Success',
        description: 'Account created! Check your email for confirmation.',
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Could not create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <Tabs defaultValue="sign-in" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sign-in">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input 
              id="signin-email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password">Password</Label>
              <Button 
                variant="link" 
                type="button" 
                className="px-0 text-sm" 
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
            <Input 
              id="signin-password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="sign-up">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input 
              id="signup-email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input 
              id="signup-password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
