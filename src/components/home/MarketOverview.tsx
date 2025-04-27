
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import axios from "axios";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  volume: string;
  marketCap: string;
  chart: number[];
}

const MarketOverview = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
  const [stockAssets, setStockAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h"
        );
        
        const formattedData = response.data.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
          volume: formatCurrency(coin.total_volume),
          marketCap: formatCurrency(coin.market_cap),
          // Generate mock chart data for visualization
          chart: generateMockChartData(coin.price_change_percentage_24h)
        }));
        
        setCryptoAssets(formattedData);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setCryptoAssets(defaultCryptoMarkets);
        toast.error("Error loading crypto data. Using sample data instead.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCryptoData();
  }, []);

  // Set stock data - using mock data since most free stock APIs are limited
  useEffect(() => {
    setStockAssets(defaultStockMarkets);
  }, []);
  
  // Format large numbers to currency format with K, M, B suffixes
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  // Generate mock chart data based on price trend
  const generateMockChartData = (change: number): number[] => {
    const trend = change >= 0 ? 1 : -1;
    const baseValue = 50;
    const chartData = [];
    
    for (let i = 0; i < 12; i++) {
      // Generate a value that generally follows the trend
      const randomFactor = Math.random() * 5;
      const trendFactor = trend * (Math.random() * 2);
      chartData.push(baseValue + (i * trendFactor) + randomFactor);
    }
    
    return chartData;
  };
  
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
              Last updated: {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="crypto" className="mt-0 space-y-1">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center p-4 hover:bg-secondary/30 rounded-lg transition-colors">
                        <div className="flex-1 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary/40 animate-pulse"></div>
                          <div>
                            <div className="h-4 w-24 bg-secondary/40 rounded animate-pulse mb-1"></div>
                            <div className="h-3 w-12 bg-secondary/40 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="hidden md:block w-32">
                          <div className="h-10 w-full bg-secondary/40 rounded animate-pulse"></div>
                        </div>
                        <div className="flex-1 text-right">
                          <div className="h-4 w-20 bg-secondary/40 rounded animate-pulse ml-auto mb-1"></div>
                          <div className="h-3 w-16 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                        </div>
                        <div className="hidden md:block flex-1 text-right">
                          <div className="h-4 w-16 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                        </div>
                        <div className="hidden md:block flex-1 text-right">
                          <div className="h-4 w-20 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                        </div>
                        <div className="ml-4 md:ml-6">
                          <div className="h-8 w-8 bg-secondary/40 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    cryptoAssets.map((asset) => (
                      <AssetRow key={asset.id} asset={asset} type="crypto" />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="stocks" className="mt-0 space-y-1">
                  {stockAssets.map((asset) => (
                    <AssetRow key={asset.id} asset={asset} type="stock" />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/markets">
                  <AreaChart className="h-4 w-4" />
                  <span>View All Markets</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

interface AssetRowProps {
  asset: Asset;
  type: 'crypto' | 'stock';
}

const AssetRow = ({ asset, type }: AssetRowProps) => {
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
    <Link to={`/trading?symbol=${asset.symbol}&id=${asset.id}`} className="block">
      <div className="flex items-center p-4 hover:bg-secondary/30 rounded-lg transition-colors">
        <div className="flex-1 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary">
            {type === 'crypto' && 
              (asset.symbol === "BTC" ? 
                <Bitcoin className="h-4 w-4 text-accent" /> : 
                <span className="text-sm text-accent font-medium">{asset.symbol.substring(0, 3)}</span>)
            }
            {type === 'stock' && <span className="text-sm text-accent font-medium">{asset.symbol.substring(0, 4)}</span>}
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
          <p className={`text-sm flex items-center justify-end ${asset.change >= 0 ? 'text-success' : 'text-destructive'}`}>
            {asset.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(asset.change).toFixed(2)}%
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
    </Link>
  );
};

// Default data as fallback if API fails
const defaultCryptoMarkets = [
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

const defaultStockMarkets = [
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

export default MarketOverview;
