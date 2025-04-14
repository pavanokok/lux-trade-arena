
import { BarChart3 } from "lucide-react";

const FeaturedIn = () => {
  return (
    <section className="py-16 bg-secondary/10">
      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="text-center mb-10">
          <p className="text-lg font-medium text-muted-foreground">Featured In</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {/* These would normally be actual logos, using placeholders for now */}
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">Bloomberg</span>
          </div>
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">Forbes</span>
          </div>
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">CNBC</span>
          </div>
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">TechCrunch</span>
          </div>
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">Reuters</span>
          </div>
          <div className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity">
            <BarChart3 className="h-6 w-6 mr-2 text-muted-foreground" />
            <span className="font-display font-medium text-muted-foreground">WSJ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;
