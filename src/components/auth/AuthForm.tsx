import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  adminEmails,
}: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage(null);
    setVerificationRequired(false);
    
    // Simple validation
    if (!email || !password) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    
    // Password validation for signup
    if (isSignUp && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} user: ${email}`);
      
      if (isSignUp) {
        // First check if the user already exists to provide better feedback
        const { data: existingUser } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false }
        });
        
        if (existingUser) {
          setErrorMessage("An account with this email already exists. Please try signing in instead.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }
      
        // Creating a new user - use try/catch specifically for database errors
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
              // Important: Only set emailRedirectTo if you want to force email verification
              emailRedirectTo: window.location.origin + '/auth',
            },
          });
          
          if (error) {
            console.error("Signup error:", error);
            
            // Check for specific database-related errors
            if (error.message.includes('database') || error.message.includes('Database')) {
              setErrorMessage("Database error creating user. Please try again or contact support. Error: " + error.message);
            } else {
              throw error;
            }
            return;
          }
          
          if (data?.user) {
            console.log("User created successfully:", data.user.id);
            
            // Manually create user role to ensure it exists
            try {
              // Try to insert user role
              const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                  user_id: data.user.id,
                  role: adminEmails.includes(email) ? 'admin' : 'user'
                });
                
              if (roleError && !roleError.message.includes('duplicate')) {
                console.error("Error creating user role:", roleError);
                // Continue with the signup process even if role creation fails
              }
            } catch (roleError) {
              console.error("Exception in role creation:", roleError);
              // Continue with the signup process even if role creation fails
            }
            
            // Check if email confirmation is needed
            if (data.session) {
              // No email confirmation needed - user can login right away
              toast({
                title: "Account created successfully!",
                description: "You have been automatically logged in.",
              });
              
              // Check if user is an admin
              const isAdmin = adminEmails.includes(email);
              
              // Redirect based on role
              if (isAdmin) {
                navigate('/admin');
              } else {
                navigate('/');
              }
            } else {
              // Email confirmation is needed
              setVerificationRequired(true);
              toast({
                title: "Account created successfully!",
                description: "Please check your email for verification instructions, then sign in.",
              });
              
              // Auto-switch to sign in mode
              setIsSignUp(false);
              setPassword("");
            }
          }
        } catch (dbError: any) {
          console.error("Database error during signup:", dbError);
          setErrorMessage(`Database error: ${dbError.message || "Unknown database error"}`);
        }
      } else {
        // Signing in an existing user
        console.log("Attempting to sign in with:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error);
          
          // Special handling for invalid login credentials
          if (error.message.includes('Invalid login')) {
            // Check if user exists but email is not confirmed
            const { data: userData } = await supabase.auth.signInWithOtp({
              email,
              options: {
                shouldCreateUser: false,
              }
            });
            
            if (userData) {
              setErrorMessage("Please verify your email address before signing in. Check your inbox for a verification link.");
              setVerificationRequired(true);
            } else {
              setErrorMessage("Invalid email or password. Please try again.");
            }
          } else {
            setErrorMessage(error.message);
          }
          return;
        }
        
        if (data?.session) {
          console.log("Login successful, redirecting...");
          
          // Check if user is an admin
          const isAdmin = adminEmails.includes(email);
          
          // Redirect based on role
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
          
          toast({
            title: "Welcome back!",
            description: "You've been successfully logged in.",
          });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
        },
      });
      
      if (error) {
        setErrorMessage(error.message);
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isSignUp
            ? 'Create a new Avishkar Academy account'
            : 'Sign in to your Avishkar Academy account'}
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {verificationRequired && !isSignUp && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="flex flex-col space-y-2">
            <span>Please verify your email before signing in.</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resendVerificationEmail}
              disabled={loading}
              className="self-start text-xs"
            >
              Resend verification email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAuth}>
        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-academy-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-academy-primary hover:bg-academy-primary/90"
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
              setVerificationRequired(false);
            }}
            className="text-academy-primary hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <div className="mt-4">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="text-xs text-gray-500 px-2">or continue as</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={authType === 'user' ? 'default' : 'outline'}
            className={authType === 'user' ? 'bg-academy-primary' : ''}
            onClick={() => setAuthType('user')}
          >
            Student
          </Button>
          <Button
            type="button"
            variant={authType === 'admin' ? 'default' : 'outline'}
            className={authType === 'admin' ? 'bg-academy-red' : ''}
            onClick={() => setAuthType('admin')}
          >
            Administrator
          </Button>
        </div>
      </div>
    </div>
  );
};
