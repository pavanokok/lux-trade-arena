
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, CheckCircle2 } from "lucide-react";

const Demo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      
      toast({
        title: "Demo Request Received",
        description: "We'll be in touch with you shortly to schedule your demo.",
      });
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-10 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">Request a Live Demo</h1>
          <p className="text-muted-foreground mb-6">
            See how our premium trading platform can transform your trading experience and help you make better investment decisions.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-full mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Interactive Platform Tour</h3>
                <p className="text-muted-foreground text-sm">
                  Get a comprehensive walkthrough of our advanced trading features and tools.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-full mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Custom Strategy Consultation</h3>
                <p className="text-muted-foreground text-sm">
                  Our experts will show you how to implement your specific trading strategy on our platform.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-full mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Exclusive Features Preview</h3>
                <p className="text-muted-foreground text-sm">
                  Be the first to see upcoming features and enhancements before they're publicly released.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          {isSubmitted ? (
            <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Request Submitted
                </CardTitle>
                <CardDescription>
                  Thank you for your interest in our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your demo request has been successfully submitted. One of our representatives will contact you within 24 hours to schedule your personalized demo session.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <Calendar className="h-4 w-4" />
                  <span>You'll receive a calendar invitation once scheduled</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setIsSubmitted(false)}>
                  Submit Another Request
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Schedule Your Demo</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll contact you to arrange a time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name*</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Acme Inc."
                          value={formData.company}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email*</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="message">Additional Information*</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please share any specific features or questions you'd like to cover in the demo..."
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Request Demo"
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our privacy policy
                      and terms of service.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;
