
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import "@/firebase";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (user && !loading) {
      console.log('User already authenticated, redirecting to home');
      navigate('/');
    }
  }, [user, navigate, loading]);

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
          <h3 className="text-sm font-semibold text-blue-800 mb-2">📱 SMS Authentication Setup:</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>For Production:</strong> Enable billing in Firebase Console</p>
            <p><strong>For Development:</strong> Use test numbers in Firebase Console</p>
            <p><strong>Test Number:</strong> +918888769281 (OTP: any 6 digits)</p>
            <hr className="my-2 border-blue-200" />
            <p className="font-medium">How to Login:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Enter phone number with country code (+91...)</li>
              <li>Click "Send OTP" and wait for SMS</li>
              <li>Enter the 6-digit verification code</li>
              <li>Click "Verify & Login" to access your account</li>
            </ol>
          </div>
        </div>
        
        <AuthForm />

        <div id="recaptcha-container" style={{ height: 0, overflow: "hidden" }} />
      </div>
    </div>
  );
};

export default Auth;
