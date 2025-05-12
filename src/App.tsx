
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import HomePage from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import DemoPage from "./pages/Demo";
import TradingPage from "./pages/Trading";
import MarketsPage from "./pages/Markets";
import PortfolioPage from "./pages/Portfolio";
import NewsPage from "./pages/News";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet>
          <title>Phoenix - Premium Trading Platform</title>
          <meta name="description" content="Phoenix is a premium trading platform for trading cryptocurrencies and stocks with professional tools and real-time market data." />
        </Helmet>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar user={user} />
          <div className="min-h-screen pt-16">
            {loading ? (
              <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/trading" element={<TradingPage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/portfolio" element={user ? <PortfolioPage /> : <Navigate to="/login" />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </div>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
