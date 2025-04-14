
import { useState } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  Bitcoin, 
  Landmark, 
  AreaChart,
  RefreshCcw,
  ChevronRight 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock market data
const cryptoMarkets = [
  { 
    id: "btc", 
    name: "Bitcoin", 
    symbol: "BTC", 
    price: 56842.12, 
    change: 3.42, 
    volume: "$48.2B",
    marketCap: "$1.1T",
    chart: [42, 45, 43, 44, 46, 47, 48, 45, 46, 49, 50, 51]
  },
  { 
    id: "eth", 
    name: "Ethereum", 
    symbol: "ETH", 
    price: 3245.67, 
    change: 2.18, 
    volume: "$21.3B",
    marketCap: "$389.5B",
    chart: [38, 40, 37, 39, 41, 40, 41, 43, 44, 45, 46, 44]
  },
  { 
    id: "sol", 
    name: "Solana", 
    symbol: "SOL", 
    price: 123.45, 
    change: 5.67, 
    volume: "$5.7B",
    marketCap: "$49.8B",
    chart: [30, 32, 33, 34, 36, 38, 37, 39, 40, 42, 43, 45]
  },
  { 
    id: "ada", 
    name: "Cardano", 
    symbol: "ADA", 
    price: 0.5498, 
    change: -2.34, 
    volume: "$2.1B",
    marketCap: "$19.2B",
    chart: [20, 22, 21, 19, 18, 17, 16, 18, 17, 16, 15, 14]
  },
  { 
    id: "bnb", 
    name: "Binance Coin", 
    symbol: "BNB", 
    price: 582.73, 
    change: 1.25, 
    volume: "$1.9B",
    marketCap: "$89.4B",
    chart: [50, 51, 52, 53, 51, 52, 53, 54, 55, 56, 55, 56]
  }
];

const stockMarkets = [
  { 
    id: "aapl", 
    name: "Apple Inc.", 
    symbol: "AAPL", 
    price: 182.89, 
    change: 1.34, 
    volume: "$8.2B",
    marketCap: "$2.9T",
    chart: [42, 43, 44, 45, 44, 45, 46, 47, 46, 45, 46, 48]
  },
  { 
    id: "msft", 
    name: "Microsoft", 
    symbol: "MSFT", 
    price: 415.56, 
    change: 0.89, 
    volume: "$5.1B",
    marketCap: "$3.1T",
    chart: [60, 61, 62, 63, 62, 63, 64, 65, 66, 67, 66, 67]
  },
  { 
    id: "googl", 
    name: "Alphabet", 
    symbol: "GOOGL", 
    price: 146.95, 
    change: -0.23, 
    volume: "$3.2B",
    marketCap: "$1.85T",
    chart: [55, 54, 55, 56, 54, 53, 54, 53, 52, 53, 52, 51]
  },
  { 
    id: "amzn", 
    name: "Amazon", 
    symbol: "AMZN", 
    price: 178.75, 
    change: 2.45, 
    volume: "$6.4B",
    marketCap: "$1.84T",
    chart: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
  },
  { 
    id: "tsla", 
    name: "Tesla", 
    symbol: "TSLA", 
    price: 176.75, 
    change: -1.98, 
    volume: "$10.2B",
    marketCap: "$560.3B",
    chart: [28, 27, 28, 26, 25, 24, 23, 22, 23, 24, 23, 22]
  }
];

interface AssetRowProps {
  asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    volume: string;
    marketCap: string;
    chart: number[];
  };
}

const AssetRow = ({ asset }: AssetRowProps) => {
  // Create a simplified sparkline with SVG
  const chartHeight = 40;
  const chartWidth = 120;
  const min = Math.min(...asset.chart);
  const max = Math.max(...asset.chart);
  const range = max - min;
  
  const points = asset.chart.map((value, index) => {
    const x = (index / (asset.chart.length - 1)) * chartWidth;
    const y = chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center p-4 hover:bg-secondary/30 rounded-lg transition-colors">
      <div className="flex-1 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary">
          {asset.id === "btc" && <Bitcoin className="h-4 w-4 text-accent" />}
          {asset.id === "eth" && <span className="text-sm text-accent font-medium">ETH</span>}
          {asset.id === "sol" && <span className="text-sm text-accent font-medium">SOL</span>}
          {asset.id === "ada" && <span className="text-sm text-accent font-medium">ADA</span>}
          {asset.id === "bnb" && <span className="text-sm text-accent font-medium">BNB</span>}
          {asset.id === "aapl" && <span className="text-sm text-accent font-medium">AAPL</span>}
          {asset.id === "msft" && <span className="text-sm text-accent font-medium">MSFT</span>}
          {asset.id === "googl" && <span className="text-sm text-accent font-medium">GOOG</span>}
          {asset.id === "amzn" && <span className="text-sm text-accent font-medium">AMZN</span>}
          {asset.id === "tsla" && <span className="text-sm text-accent font-medium">TSLA</span>}
        </div>
        <div>
          <p className="font-semibold">{asset.name}</p>
          <p className="text-xs text-muted-foreground">{asset.symbol}</p>
        </div>
      </div>
      <div className="hidden md:block w-32">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          <path 
            d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight}`} 
            fill={asset.change >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"} 
          />
          <polyline 
            points={points} 
            fill="none" 
            stroke={asset.change >= 0 ? "#10B981" : "#EF4444"} 
            strokeWidth="1.5" 
          />
        </svg>
      </div>
      <div className="flex-1 text-right">
        <p className="font-mono font-medium">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className={`text-sm flex items-center justify-end ${asset.change >= 0 ? 'text-success' : 'text-danger'}`}>
          {asset.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {Math.abs(asset.change)}%
        </p>
      </div>
      <div className="hidden md:block flex-1 text-right">
        <p className="text-sm font-medium">{asset.volume}</p>
        <p className="text-xs text-muted-foreground">24h Vol</p>
      </div>
      <div className="hidden md:block flex-1 text-right">
        <p className="text-sm font-medium">{asset.marketCap}</p>
        <p className="text-xs text-muted-foreground">Market Cap</p>
      </div>
      <div className="ml-4 md:ml-6">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

const MarketOverview = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Market Overview</h2>
            <p className="text-muted-foreground mt-1">Track real-time market data across global assets</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="crypto" className="gap-2">
                <Bitcoin className="h-4 w-4" />
                <span>Crypto</span>
              </TabsTrigger>
              <TabsTrigger value="stocks" className="gap-2">
                <Landmark className="h-4 w-4" />
                <span>Stocks</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Top Performers</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            <CardDescription>
              Last updated: April 14, 2025 at 12:45 PM
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden">
              <TabsContent value="crypto" className="mt-0 space-y-1">
                {cryptoMarkets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
                ))}
              </TabsContent>
              <TabsContent value="stocks" className="mt-0 space-y-1">
                {stockMarkets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
                ))}
              </TabsContent>
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" className="gap-2">
                <AreaChart className="h-4 w-4" />
                <span>View All Markets</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MarketOverview;
