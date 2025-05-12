
import React from "react";
import HeroSection from "@/components/home/HeroSection";
import PriceTickerBanner from "@/components/home/PriceTickerBanner";
import MarketOverview from "@/components/home/MarketOverview";
import TradingFeatures from "@/components/home/TradingFeatures";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FeaturedIn from "@/components/home/FeaturedIn";
import CtaSection from "@/components/home/CtaSection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <Helmet>
        <title>Phoenix - Premium Trading Platform</title>
        <meta name="description" content="Phoenix is a premium trading platform offering a sophisticated experience for trading stocks and cryptocurrencies with professional-grade tools and real-time data." />
      </Helmet>
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
