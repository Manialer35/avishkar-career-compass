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

type AuthFormProps = React.HTMLAttributes<HTMLDivElement>;

const buttonVariants =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-500";

export function AuthForm({ className, ...props }: AuthFormProps) {
  const { signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      let authResult;
      if (isLogin) {
        authResult = await signIn(email, password);
      } else {
        authResult = await signUp(email, password);
      }

      const { error } = authResult;

      if (error) {
        console.error("Authentication error:", error);
        setErrorMsg(
          error.message || 
          "An error occurred during authentication"
        );
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: `Successfully ${isLogin ? "logged in" : "registered"}.`,
      });

      const redirectTo = searchParams.get("redirectTo") || "/";
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Authentication error:", error);
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
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
            <Button disabled={loading}>
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <Separator />
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
