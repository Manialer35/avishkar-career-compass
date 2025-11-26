import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AuthForm: React.FC = () => {
  const { signInWithGoogle, loading, user } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      console.log("Google sign in result:", result);
      
      // Only show success if we have a user
      if (result) {
        toast.success("Successfully signed in with Google!");
      }
    } catch (error: any) {
      console.error("Google sign in error in AuthForm:", {
        code: error?.code,
        message: error?.message,
        errorString: error?.toString(),
        full: JSON.stringify(error)
      });
      
      // Only show error for actual errors, not cancelled sign-ins
      if (error?.code === 'auth/operation-not-allowed') {
        toast.error("Google Sign-in not enabled in Firebase Console");
      } else if (error?.code === 'auth/popup-closed-by-user' || 
                 error?.code === 'auth/cancelled-popup-request' ||
                 error?.code === '12501') {
        // User cancelled - don't show error
        console.log("User cancelled sign-in");
      } else if (error?.code === 'auth/unauthorized-domain') {
        toast.error("Domain not authorized in Firebase Console");
      } else if (error?.code === '12500') {
        toast.error("Android Google Sign-in configuration error (12500). Check SHA fingerprints in Firebase Console");
      } else if (error?.code === '10') {
        toast.error("Google Services configuration error (code 10). Verify google-services.json");
      } else if (error?.message && 
                 !error?.message.toLowerCase().includes('cancel') &&
                 !error?.message.includes('12501')) {
        // Show the actual error for debugging
        const errorMsg = error?.code ? `Error ${error.code}: ${error.message}` : "Failed to sign in with Google. Please try again.";
        toast.error(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">Welcome!</h3>
        <p className="text-muted-foreground">{user?.email || user?.displayName || "User"}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <Button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-3"
          variant="outline"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;