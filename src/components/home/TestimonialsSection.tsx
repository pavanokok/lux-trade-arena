
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock testimonial data
const testimonials = [
  {
    id: 1,
    name: "Alex Thompson",
    position: "Hedge Fund Manager",
    company: "Quantum Capital",
    avatar: "/testimonial-1.jpg",
    content: "LuxTrade has completely transformed our trading operations. The platform's speed and sophisticated tools give us a competitive edge in the market. The analytics are unmatched.",
    rating: 5
  },
  {
    id: 2,
    name: "Sophia Chen",
    position: "Investment Director",
    company: "Global Investments Inc.",
    avatar: "/testimonial-2.jpg",
    content: "As someone who manages portfolios across multiple asset classes, having everything in one elegant platform saves us countless hours. The real-time data and visualizations are stunning.",
    rating: 5
  },
  {
    id: 3,
    name: "James Wilson",
    position: "Private Trader",
    company: "Independent",
    avatar: "/testimonial-3.jpg",
    content: "The attention to detail in this platform is remarkable. Everything from the chart analysis tools to the order execution is perfectly designed for professional traders.",
    rating: 4
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    position: "Wealth Manager",
    company: "Premier Wealth Advisors",
    avatar: "/testimonial-4.jpg",
    content: "My clients are impressed when I show them their portfolios on LuxTrade. The visual representations and reporting tools help communicate complex financial information beautifully.",
    rating: 5
  },
  {
    id: 5,
    name: "Michael Chang",
    position: "Crypto Fund Manager",
    company: "Digital Asset Partners",
    avatar: "/testimonial-5.jpg",
    content: "The crypto trading features on this platform are far beyond what competitors offer. Real-time order book depth, advanced charting, and instant execution - it's all flawless.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Trusted by Elite Investors
          </h2>
          <p className="text-lg text-muted-foreground">
            See what professional traders and financial institutions say about our platform
          </p>
        </div>
        
        <div className="relative px-4 md:px-12 py-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-8 md:p-10 relative">
                      <Quote className="absolute top-8 right-8 h-20 w-20 text-primary/5" />
                      <div className="flex space-x-1 mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-accent fill-accent' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <blockquote className="text-xl md:text-2xl mb-8 relative z-10">
                        "{testimonial.content}"
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center text-lg font-medium">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.position}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          <div className="flex justify-center space-x-2 mt-6 md:hidden">
            <Button variant="outline" size="sm" onClick={prevTestimonial}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={nextTestimonial}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
                onClick={() => setActiveIndex(i)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
