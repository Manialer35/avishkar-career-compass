
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const returnTo = (location.state as any)?.returnTo as string | undefined;
  
  // If user is already authenticated, redirect immediately
  useEffect(() => {
    if (user && !loading) {
      console.log('User authenticated, redirecting');
      // Use replace to prevent back button issues
      navigate(returnTo || '/', { replace: true });
    }
  }, [user, loading, navigate, returnTo]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user exists but we're still on this page, force redirect
  if (user) {
    console.log('User exists, forcing redirect');
    navigate(((location.state as any)?.returnTo as string | undefined) || '/', { replace: true });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Aavishkar Academy
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to sign in or create a new account
          </p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
