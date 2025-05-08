
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthForm } from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authType, setAuthType] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // List of admin emails - these will automatically be assigned admin role
  const adminEmails = ['khot.md@gmail.com', 'neerajmadkar35@gmail.com'];

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("User is already logged in, redirecting...");
          // Redirect based on role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .maybeSingle();
          
          console.log("Initial role check:", roleData);
          
          // If the user is an admin (by email or role), redirect to admin panel
          if ((roleData && roleData.role === 'admin') || 
              (data.session.user.email && adminEmails.includes(data.session.user.email))) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Check for query parameters indicating actions like password reset
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    
    if (type === 'recovery') {
      setActionMessage("You can now reset your password.");
    }
    
    if (type === 'signup') {
      setActionMessage("Your account has been created. Please check your email for verification.");
    }
    
    checkSession();
  }, [navigate, adminEmails]);

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
  };

  // Create admin account for testing
  const createTestAdmin = async () => {
    setLoading(true);
    try {
      // First sign out any existing user
      await supabase.auth.signOut();
      
      // Create test admin credentials
      const testEmail = "test-admin@example.com";
      const testPassword = "Admin@123";
      
      // Sign up the test admin
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Test Admin Created",
        description: `Email: ${testEmail}, Password: ${testPassword}. Please sign in now with these credentials.`,
        duration: 10000, // Show for 10 seconds
      });
      
      // Pre-fill the login form
      setEmail(testEmail);
      setPassword(testPassword);
      setAuthType('admin');
      setIsSignUp(false);
      
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
        <ForgotPasswordForm 
          email={email} 
          setEmail={setEmail} 
          onBack={handleBackToLogin} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {actionMessage && (
        <Alert className="mb-4 max-w-md">
          <Info className="h-4 w-4" />
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}
      
      <AuthForm
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        authType={authType}
        setAuthType={setAuthType}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        onForgotPassword={handleForgotPasswordClick}
        adminEmails={adminEmails}
      />
      
      <button
        onClick={createTestAdmin}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Test Admin Account"}
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Admin emails: {adminEmails.join(', ')}</p>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md max-w-md">
        <h3 className="text-sm font-medium text-blue-800 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Authentication Troubleshooting
        </h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>If you created an account but can't log in, check your email for verification</li>
          <li>Try clearing your browser cache or using a private/incognito window</li>
          <li>Make sure you're using the correct email and password combination</li>
          <li>If problems persist, use the "Create Test Admin Account" button</li>
        </ul>
      </div>
    </div>
  );
};

export default Auth;
