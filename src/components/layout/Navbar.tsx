
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavbarProps {
  user: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };
    
    window.addEventListener("popstate", handleRouteChange);
    
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <nav className="py-4 px-6 md:px-8 border-b border-border/40 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md animated-gradient"></div>
            <span className="text-xl font-display font-medium tracking-tight hidden sm:inline-block">LuxTrade</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/markets" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Markets
            </Link>
            <Link to="/trading" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Trading
            </Link>
            <Link to="/portfolio" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Portfolio
            </Link>
            <Link to="/news" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              News
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="flex flex-col items-start py-3">
                    <span className="text-sm font-medium">No new notifications</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full px-4 gap-2 border-border/40">
                <UserIcon className="h-4 w-4" />
                <span>{user ? 'Account' : 'Sign In'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio">Portfolio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 md:hidden animate-fade-in">
            <Link to="/markets" className="py-2 text-sm font-medium">
              Markets
            </Link>
            <Link to="/trading" className="py-2 text-sm font-medium">
              Trading
            </Link>
            <Link to="/portfolio" className="py-2 text-sm font-medium">
              Portfolio
            </Link>
            <Link to="/news" className="py-2 text-sm font-medium">
              News
            </Link>
            <div className="flex justify-between">
              {user ? (
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-1/2 mr-2" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-1/2 ml-2" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
