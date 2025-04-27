
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

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Show success toast and display email sent message
      toast.success("Account created successfully");
      setEmailSent(true);
      
      // Reset form
      setPassword("");
      setConfirmPassword("");
      
      // Navigate to dashboard if email verification is not required
      if (data.session) {
        navigate("/portfolio");
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-10 md:py-20 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-display font-bold mb-2 text-center">Create Your Account</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Join the premium trading platform today and start building your portfolio
        </p>
        
        {emailSent && (
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Verification email sent! Please check your inbox and spam folder to complete your registration.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || emailSent}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || emailSent}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || emailSent}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || emailSent}
                  />
                </div>
                
                {!emailSent ? (
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    Continue to Login
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
            <div className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
