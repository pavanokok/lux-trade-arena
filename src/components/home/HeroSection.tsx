
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Premium Trading Experience for Elite Investors
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Access global markets with our sophisticated trading platform. Trade stocks and cryptocurrencies with professional-grade tools and real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <Button size="lg" className="text-base shadow-glow" asChild>
              <Link to="/trading">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link to="/markets">Explore Markets</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 w-full">
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl md:text-4xl font-display font-bold text-accent mb-2">$4.2B+</span>
              <span className="text-sm text-muted-foreground">Daily Trading Volume</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl md:text-4xl font-display font-bold text-accent mb-2">240+</span>
              <span className="text-sm text-muted-foreground">Global Markets</span>
            </div>
            <div className="flex flex-col items-center p-4 col-span-2 md:col-span-1">
              <span className="text-3xl md:text-4xl font-display font-bold text-accent mb-2">10ms</span>
              <span className="text-sm text-muted-foreground">Execution Speed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
