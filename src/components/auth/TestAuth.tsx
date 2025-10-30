import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const TestAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate successful login for testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Test Login Successful",
        description: "Redirecting to home page...",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Test Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Test Authentication</h1>
        <p className="text-gray-600 mt-2">
          This is a test mode for the preview environment
        </p>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertDescription className="text-yellow-800">
          ⚠️ This is a test authentication for the preview environment. In production, use Firebase phone authentication.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleTestLogin} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Test)
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 8888769281"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter any phone number for testing
          </p>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !phoneNumber}
        >
          {loading ? "Logging in..." : "Test Login"}
        </Button>
      </form>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">Test Mode Info</h3>
        <p className="text-blue-700">
          This test authentication allows you to test the app without Firebase setup.<br />
          In production, replace this with proper Firebase authentication.
        </p>
      </div>
    </div>
  );
};

export default TestAuth;