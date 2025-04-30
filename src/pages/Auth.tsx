import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, UserPlus, LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authType, setAuthType] = useState<'user' | 'admin'>('user');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect based on role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .single();
        
        console.log("Initial role check:", roleData);
        
        if (roleData && roleData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    };
    
    checkSession();
  }, [navigate]);

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
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });

        // Wait a moment for the trigger to create the role
        setTimeout(async () => {
          const { data: session } = await supabase.auth.getSession();
          if (session.session) {
            // Check role and redirect accordingly
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.session.user.id)
              .single();
            
            console.log("Role after signup:", roleData);
            
            if (roleData && roleData.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }
        }, 1000);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check user role and redirect accordingly
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        
        console.log("Role after signin:", roleData);
        
        if (roleData && roleData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the resetPassword function from useAuth context
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
      
      // Return to login screen after sending reset email
      setIsForgotPassword(false);
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

  // Render forgot password screen
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                onClick={() => setIsForgotPassword(false)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-academy-primary">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        
        <Tabs defaultValue="user" onValueChange={(value) => setAuthType(value as 'user' | 'admin')} className="mt-6">
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
                onClick={() => setIsForgotPassword(true)}
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
    </div>
  );
};

export default Auth;
