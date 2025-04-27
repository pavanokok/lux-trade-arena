
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailTip, setShowEmailTip] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Start loading state
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setShowEmailTip(true);
          throw new Error("Please check your email to confirm your account before logging in");
        }
        throw error;
      }
      
      // Show success toast
      toast.success("Successfully logged in");
      
      // Navigate to dashboard
      navigate("/portfolio");
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset password email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-10 md:py-20 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-display font-bold mb-2 text-center">Welcome Back</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Log in to your account to continue trading
        </p>
        
        {showEmailTip && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              Please check your email inbox and spam folder for the verification email.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1 text-yellow-600" 
                onClick={() => setShowEmailTip(false)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={handleResetPassword}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
