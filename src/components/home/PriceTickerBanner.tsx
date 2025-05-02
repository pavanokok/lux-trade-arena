import { useRef, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { 
  getAssetCurrentPrice, 
  formatPrice, 
  defaultCryptoAssets, 
  defaultStockAssets, 
  AssetType,
  formatPercentage
} from "@/utils/marketData";
import { toast } from "sonner";
import axios from "axios";

interface Ticker {
  symbol: string;
  name: string;
  price: number | null;
  change: number;
  isLoading: boolean;
}

// List of tickers to display in the banner
const initialTickers: Ticker[] = [
  ...defaultCryptoAssets.slice(0, 6).map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    price: null,
    change: 0,
    isLoading: true
  })),
  ...defaultStockAssets.slice(0, 4).map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    price: null,
    change: 0,
    isLoading: true
  }))
];

const PriceTickerBanner = () => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current prices for all tickers
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Try to fetch real crypto data first
        let cryptoData: any[] = [];
        try {
          const response = await axios.get(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h"
          );
          
          cryptoData = response.data;
        } catch (error) {
          console.error("Error fetching live crypto data:", error);
        }

        const updatedTickers = await Promise.all(
          tickers.map(async (ticker) => {
            try {
              // First check if we have real-time data from the API
              const liveCrypto = cryptoData.find(
                coin => coin.symbol.toUpperCase() === ticker.symbol.toUpperCase()
              );
              
              if (liveCrypto) {
                // Use real API data when available
                return {
                  ...ticker,
                  price: liveCrypto.current_price,
                  change: liveCrypto.price_change_percentage_24h,
                  isLoading: false
                };
              }
              
              // Otherwise try to get current price from our standard method
              const price = await getAssetCurrentPrice(ticker.symbol.toLowerCase());
              
              // Use consistent default values for change as a fallback
              const defaultAsset = [...defaultCryptoAssets, ...defaultStockAssets].find(
                asset => asset.symbol.toLowerCase() === ticker.symbol.toLowerCase()
              );
              const change = defaultAsset?.change || 0;
              
              return {
                ...ticker,
                price,
                change,
                isLoading: false
              };
            } catch (error) {
              console.error(`Error fetching price for ${ticker.symbol}:`, error);
              return { ...ticker, isLoading: false };
            }
          })
        );
        
        setTickers(updatedTickers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching ticker data:", error);
        setIsLoading(false);
        toast.error("Failed to load market data");
      }
    };
    
    fetchPrices();
    
    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle animation pause/play based on visibility
  useEffect(() => {
    if (tickerRef.current) {
      // Force the animation to restart
      tickerRef.current.classList.remove("animate-ticker");
      void tickerRef.current.offsetWidth; // Trigger reflow
      tickerRef.current.classList.add("animate-ticker");
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // If in viewport, play animation by adding class
            entry.target.classList.add("animate-ticker");
          } else {
            // If not in viewport, pause animation by removing class
            entry.target.classList.remove("animate-ticker");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (tickerRef.current) {
      observer.observe(tickerRef.current);
    }

    return () => {
      if (tickerRef.current) {
        observer.unobserve(tickerRef.current);
      }
    };
  }, []);

  // Filter out tickers with no price data
  const validTickers = tickers.filter(ticker => ticker.price !== null);
  
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden bg-background border-y border-border/40 py-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }
  
  if (validTickers.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-background border-y border-border/40 py-4">
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">Market data unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-background border-y border-border/40 py-4">
      <div className="flex whitespace-nowrap animate-ticker" ref={tickerRef}>
        {/* Duplicate tickers to create seamless loop */}
        {[...validTickers, ...validTickers].map((ticker, index) => (
          <div key={index} className="ticker-item flex items-center px-3">
            <span className="font-medium mr-2">{ticker.symbol}</span>
            <span className="text-muted-foreground mr-2">{ticker.name}</span>
            <span className="font-mono mr-2">
              {ticker.price !== null ? formatPrice(ticker.price) : 'Loading...'}
            </span>
            <span className={`flex items-center ${ticker.change >= 0 ? 'text-success' : 'text-destructive'}`}>
              {ticker.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {formatPercentage(ticker.change)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTickerBanner;
