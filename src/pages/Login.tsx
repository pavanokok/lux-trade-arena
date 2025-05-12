
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailTip, setShowEmailTip] = useState(false);
  const [authMode, setAuthMode] = useState("password");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
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

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean up existing auth state to prevent conflicts
      localStorage.removeItem('supabase.auth.token');
      
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Send magic link email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/trading`,
        }
      });
      
      if (error) throw error;
      
      setOtpSent(true);
      toast.success("OTP code sent to your email");
    } catch (error: any) {
      console.error("OTP request error:", error);
      toast.error(error.message || "Failed to send OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !otp) {
      toast.error("Please enter both email and OTP code");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink'
      });
      
      if (error) throw error;
      
      toast.success("Successfully logged in");
      navigate("/trading");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Invalid OTP code");
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
        <h1 className="text-4xl font-display font-bold mb-2 text-center">Welcome to Phoenix</h1>
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
            <Tabs value={authMode} onValueChange={setAuthMode}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">Email OTP</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email-password">Email</Label>
                  <Input
                    id="email-password"
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
              </form>
            </TabsContent>
            
            <TabsContent value="otp">
              {!otpSent ? (
                <form onSubmit={handleOtpRequest} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-otp">Email</Label>
                    <Input
                      id="email-otp"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP Code"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isLoading}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full" 
                    onClick={() => setOtpSent(false)}
                    disabled={isLoading}
                  >
                    Back to Email Entry
                  </Button>
                </form>
              )}
            </TabsContent>
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
