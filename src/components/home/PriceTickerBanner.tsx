
import { useRef, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { getAssetCurrentPrice, formatPrice } from "@/utils/marketData";
import { toast } from "sonner";

interface Ticker {
  symbol: string;
  name: string;
  price: number | null;
  change: number;
  isLoading: boolean;
}

// List of tickers to display in the banner
const initialTickers: Ticker[] = [
  { symbol: "BTC", name: "Bitcoin", price: null, change: 0, isLoading: true },
  { symbol: "ETH", name: "Ethereum", price: null, change: 0, isLoading: true },
  { symbol: "SOL", name: "Solana", price: null, change: 0, isLoading: true },
  { symbol: "DOGE", name: "Dogecoin", price: null, change: 0, isLoading: true },
  { symbol: "MATIC", name: "Polygon", price: null, change: 0, isLoading: true },
  { symbol: "ADA", name: "Cardano", price: null, change: 0, isLoading: true },
  { symbol: "XRP", name: "Ripple", price: null, change: 0, isLoading: true },
  { symbol: "DOT", name: "Polkadot", price: null, change: 0, isLoading: true },
  { symbol: "AVAX", name: "Avalanche", price: null, change: 0, isLoading: true },
  { symbol: "LINK", name: "Chainlink", price: null, change: 0, isLoading: true },
];

const PriceTickerBanner = () => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current prices for all tickers
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const updatedTickers = await Promise.all(
          tickers.map(async (ticker) => {
            try {
              // Attempt to get current price
              const price = await getAssetCurrentPrice(ticker.symbol.toLowerCase());
              
              // Simulate change value calculation (in a real app, this would come from the API)
              // Here we're using a simplified approach with random changes
              const prevPrice = localStorage.getItem(`prev_price_${ticker.symbol.toLowerCase()}`);
              let change = ticker.change;
              
              if (price !== null) {
                if (prevPrice) {
                  change = ((price - parseFloat(prevPrice)) / parseFloat(prevPrice)) * 100;
                } else {
                  // If no previous price, generate a random change between -5 and +5
                  change = (Math.random() * 10) - 5;
                }
                // Store current price as previous for next time
                localStorage.setItem(`prev_price_${ticker.symbol.toLowerCase()}`, price.toString());
              }
              
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
              {Math.abs(ticker.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTickerBanner;
