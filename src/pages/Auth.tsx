
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthForm } from '@/components/auth/AuthForm';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authType, setAuthType] = useState<'user' | 'admin'>('user');
  const navigate = useNavigate();

  // List of admin emails - these will automatically be assigned admin role
  const adminEmails = ['khot.md@gmail.com', 'neerajmadkar35@gmail.com'];

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

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
    </div>
  );
};

export default Auth;
