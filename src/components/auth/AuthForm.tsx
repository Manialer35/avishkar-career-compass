// src/components/auth/AuthForm.tsx
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  // Email authentication functions
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        // Sign up with Supabase
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        // Sign in with Supabase
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (isSignUp && !result.data.session) {
        setMessage("✅ Account created! Please check your email to confirm your account.");
        toast({
          title: "Account Created",
          description: "Please check your email to confirm your account",
        });
      } else {
        setMessage("✅ Login successful! Redirecting...");
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }

    } catch (error: any) {
      console.error("Email auth error:", error);
      let errorMessage = isSignUp ? "Failed to create account. " : "Failed to sign in. ";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage += "Invalid email or password.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage += "Account already exists. Try signing in instead.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage += "Password must be at least 6 characters.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage += "Please check your email and click the confirmation link.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setMessage(errorMessage);
      toast({
        title: isSignUp ? "Signup Failed" : "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </p>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Authentication */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            disabled={loading}
            required
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 6 characters required
          </p>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !email || !password}
        >
          {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : 
           (isSignUp ? "Create Account" : "Sign In")}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </Button>
      </form>

      {/* Demo Account Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">Demo Account</h3>
        <p className="text-blue-700">
          <strong>Email:</strong> neerajmadkar35@gmail.com<br />
          <strong>Password:</strong> Contact admin for demo access
        </p>
      </div>
    </div>
  );
};

export default AuthForm;