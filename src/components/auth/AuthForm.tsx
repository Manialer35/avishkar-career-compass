
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/Icons";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add the missing props that are being passed from Auth.tsx
  isSignUp?: boolean;
  setIsSignUp?: React.Dispatch<React.SetStateAction<boolean>>;
  authType?: "admin" | "user";
  setAuthType?: React.Dispatch<React.SetStateAction<"admin" | "user">>;
  email?: string;
  setEmail?: React.Dispatch<React.SetStateAction<string>>;
  password?: string;
  setPassword?: React.Dispatch<React.SetStateAction<string>>;
  fullName?: string;
  setFullName?: React.Dispatch<React.SetStateAction<string>>;
  onForgotPassword?: () => void;
  adminEmails?: string[];
}

export function AuthForm({ className, isSignUp = false, setIsSignUp, ...props }: AuthFormProps) {
  const { signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      let authResult;
      if (!isSignUp) {
        authResult = await signIn(email, password);
      } else {
        authResult = await signUp(email, password);
      }

      const { error } = authResult || {};

      if (error) {
        console.error("Authentication error:", error);
        setErrorMsg(
          error.message || 
          "An error occurred during authentication"
        );
        return;
      }

      toast({
        title: "Success!",
        description: `Successfully ${!isSignUp ? "logged in" : "registered"}.`,
      });

      const redirectTo = searchParams.get("redirectTo") || "/";
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Authentication error:", error);
      setErrorMsg(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{!isSignUp ? "Login" : "Register"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="password"
                disabled={loading}
              />
            </div>
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            <Button disabled={loading} type="submit" className="mt-4 w-full">
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isSignUp ? "Login" : "Register"}
            </Button>
          </form>
          <Separator />
          <Button variant="link" onClick={() => setIsSignUp && setIsSignUp(!isSignUp)}>
            {!isSignUp
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
