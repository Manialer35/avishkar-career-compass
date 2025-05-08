
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (value: string) => void;
  onBack: () => void;
}

export const ForgotPasswordForm = ({ email, setEmail, onBack }: ForgotPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      console.log("Attempting to reset password for:", email);
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error("Reset password error:", error);
        setErrorMessage(error.message);
        return;
      }
      
      setSuccess(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-2 p-1 rounded hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
      </div>

      {success ? (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Reset Link Sent!</h3>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <span className="font-semibold">{email}</span>.
            Please check your email to reset your password.
          </p>
          <Button onClick={onBack} variant="outline">
            Back to Sign In
          </Button>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
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
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-academy-primary hover:bg-academy-primary/90"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
              >
                Cancel
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
