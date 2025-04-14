
import { useRef, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const tickers: Ticker[] = [
  { symbol: "BTC", name: "Bitcoin", price: 56842.12, change: 3.42 },
  { symbol: "ETH", name: "Ethereum", price: 3245.67, change: 2.18 },
  { symbol: "SPY", name: "S&P 500 ETF", price: 507.73, change: 0.85 },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 437.52, change: -0.34 },
  { symbol: "SOL", name: "Solana", price: 123.45, change: 5.67 },
  { symbol: "AAPL", name: "Apple", price: 182.89, change: 1.34 },
  { symbol: "MSFT", name: "Microsoft", price: 415.56, change: 0.89 },
  { symbol: "GOOGL", name: "Google", price: 146.95, change: -0.23 },
  { symbol: "AMZN", name: "Amazon", price: 178.75, change: 2.45 },
  { symbol: "TSLA", name: "Tesla", price: 176.75, change: -1.98 },
];

const PriceTickerBanner = () => {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  return (
    <div className="w-full overflow-hidden bg-background border-y border-border/40 py-4">
      <div className="flex whitespace-nowrap" ref={tickerRef}>
        {/* Duplicate tickers to create seamless loop */}
        {[...tickers, ...tickers].map((ticker, index) => (
          <div key={index} className="ticker-item flex items-center">
            <span className="font-medium mr-2">{ticker.symbol}</span>
            <span className="text-muted-foreground mr-2">{ticker.name}</span>
            <span className="font-mono mr-2">${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`flex items-center ${ticker.change >= 0 ? 'text-success' : 'text-danger'}`}>
              {ticker.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {Math.abs(ticker.change)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTickerBanner;
