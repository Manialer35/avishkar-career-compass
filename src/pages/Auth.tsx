
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (session && !loading) {
      console.log('User already authenticated, redirecting to home');
      navigate('/');
    }
  }, [session, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-academy-primary"></div>
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
            Sign in to your account or create a new one
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Steps to Login:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Sign Up and create an account</li>
            <li>2. Go to your gmail and verify from there</li>
            <li>3. When you click on the link to verify, it will display an error, no worry</li>
            <li>4. Come back to app, and Sign In with the credentials you used</li>
          </ol>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
