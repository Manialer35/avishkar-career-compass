
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthFormProps {
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  authType: 'user' | 'admin';
  setAuthType: (value: 'user' | 'admin') => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  fullName: string;
  setFullName: (value: string) => void;
  onForgotPassword: () => void;
  adminEmails: string[];
}

export const AuthForm = ({
  isSignUp,
  setIsSignUp,
  authType,
  setAuthType,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  onForgotPassword,
  adminEmails
}: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // If email is in admin list, manually set the role to admin
        if (adminEmails.includes(email.toLowerCase())) {
          // Get the newly created user
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Insert admin role for this user
            await supabase
              .from('user_roles')
              .insert({
                user_id: userData.user.id,
                role: 'admin'
              });
          }
        }
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully. You can now sign in.",
        });

        // Go back to sign in screen
        setIsSignUp(false);
        setLoading(false);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check user role and redirect handled in parent
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-academy-primary">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
      </div>
      
      <Tabs defaultValue={authType} onValueChange={(value) => setAuthType(value as 'user' | 'admin')} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user" className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Access student resources and manage your learning journey
          </p>
        </TabsContent>
        
        <TabsContent value="admin" className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Administrative access for content management and user administration
          </p>
        </TabsContent>
      </Tabs>
      
      <form className="mt-4 space-y-6" onSubmit={handleAuth}>
        <div className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            className={`w-full ${authType === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-academy-primary hover:bg-academy-primary/90'}`}
            disabled={loading}
          >
            {authType === 'admin' ? 
              <ShieldAlert className="mr-2 h-4 w-4" /> : 
              (isSignUp ? <UserPlus className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />)
            }
            {loading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
          </Button>
          
          {!isSignUp && (
            <Button
              type="button"
              variant="link"
              onClick={onForgotPassword}
              className="text-academy-primary hover:text-academy-primary/90"
            >
              Forgot your password?
            </Button>
          )}
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-academy-primary hover:text-academy-primary/90"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </div>
      </form>
    </div>
  );
};
