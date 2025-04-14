
import { 
  LineChart, 
  Shield, 
  Zap, 
  DollarSign, 
  BarChart3, 
  ChartPie, 
  GlobeIcon 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm h-full">
    <CardContent className="pt-6">
      <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const TradingFeatures = () => {
  const features = [
    {
      icon: <LineChart className="h-6 w-6 text-primary" />,
      title: "Advanced Charts",
      description: "Professional-grade trading charts with dozens of technical indicators and drawing tools."
    },
    {
      icon: <Zap className="h-6 w-6 text-accent" />,
      title: "Lightning Fast Execution",
      description: "Execute trades with minimal latency, essential for high-frequency trading strategies."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Bank-grade Security",
      description: "Industry-leading security protocols protecting your assets and personal information."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      title: "Multiple Asset Classes",
      description: "Trade cryptocurrencies, stocks, ETFs, and commodities all on one unified platform."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Real-time Analytics",
      description: "Get instant insights with real-time market data and performance analytics."
    },
    {
      icon: <ChartPie className="h-6 w-6 text-accent" />,
      title: "Portfolio Management",
      description: "Manage and track your investments with advanced portfolio tools and reporting."
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Premium Trading Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience institutional-grade tools designed for professional traders and serious investors
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TradingFeatures;
