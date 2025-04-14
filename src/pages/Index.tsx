
import React from "react";
import HeroSection from "@/components/home/HeroSection";
import PriceTickerBanner from "@/components/home/PriceTickerBanner";
import MarketOverview from "@/components/home/MarketOverview";
import TradingFeatures from "@/components/home/TradingFeatures";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FeaturedIn from "@/components/home/FeaturedIn";
import CtaSection from "@/components/home/CtaSection";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <PriceTickerBanner />
      <MarketOverview />
      <TradingFeatures />
      <TestimonialsSection />
      <FeaturedIn />
      <CtaSection />
    </main>
  );
};

export default Index;
