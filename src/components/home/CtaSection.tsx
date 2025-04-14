
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-900/80 to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Ready to Elevate Your Trading Experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professional traders on our premium platform. Get access to advanced tools, real-time data, and sophisticated trading features.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="shadow-glow-gold" asChild>
              <Link to="/signup">
                Create Free Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/demo">Request Live Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Full-featured 14-day trial
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
