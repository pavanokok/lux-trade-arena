
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Chart from "@/components/trading/Chart";
import MarketOrder from "@/components/trading/MarketOrder";
import MarketInfo from "@/components/trading/MarketInfo";
import OrderBook from "@/components/trading/OrderBook";
import { fetchCryptoData, fetchCryptoHistoricalData, searchAssets, MarketData, CandleData } from "@/utils/marketData";
import { Bitcoin, Search, RefreshCcw, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trade } from "@/types/trade";

const AVAILABLE_ASSETS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", type: "crypto" },
  { id: "solana", symbol: "SOL", name: "Solana", type: "crypto" },
  { id: "cardano", symbol: "ADA", name: "Cardano", type: "crypto" },
  { id: "ripple", symbol: "XRP", name: "XRP", type: "crypto" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", type: "crypto" },
];

const Trading = () => {
  // Get the asset from URL parameters
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const assetSymbol = queryParams.get("symbol");
  const assetId = queryParams.get("id");

  // States for the selected asset and time period
  const [selectedAsset, setSelectedAsset] = useState(
    AVAILABLE_ASSETS.find(asset => asset.id === assetId || asset.symbol === assetSymbol) || AVAILABLE_ASSETS[0]
  );
  const [timeframe, setTimeframe] = useState("7d");
  
  // Market data states
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Trade[]>([]);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Update URL when selected asset changes
  useEffect(() => {
    navigate(`/trading?symbol=${selectedAsset.symbol}&id=${selectedAsset.id}`, { replace: true });
  }, [selectedAsset, navigate]);

  // Fetch market data when selected asset changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchCryptoData(selectedAsset.id);
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast.error(`Error loading ${selectedAsset.name} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [selectedAsset]);

  // Fetch historical data for charts
  useEffect(() => {
    const fetchHistorical = async () => {
      const days = timeframe === "1d" ? 1 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
      
      try {
        const data = await fetchCryptoHistoricalData(selectedAsset.id, days);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        toast.error(`Error loading ${selectedAsset.name} chart data`);
      }
    };

    fetchHistorical();
  }, [selectedAsset, timeframe]);

  // Handle search input
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await searchAssets(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle order placement
  const handlePlaceOrder = (order: Trade) => {
    setOrders((prev) => [order, ...prev]);
    
    // Show success notification
    toast.success(
      `${order.type === 'buy' ? 'Bought' : 'Sold'} ${order.quantity} ${order.symbol} at $${order.price.toFixed(2)}`,
      {
        description: `Total: $${order.total.toFixed(2)}`
      }
    );
  };

  // Manual refresh of data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchCryptoData(selectedAsset.id);
      setMarketData(data);
      
      const days = timeframe === "1d" ? 1 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
      const historicalData = await fetchCryptoHistoricalData(selectedAsset.id, days);
      setChartData(historicalData);
      toast.success("Market data refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Error refreshing data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-display font-bold">Trading Dashboard</h1>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
            />
            <Search className="absolute top-2.5 right-2.5 h-4 w-4 text-muted-foreground" />
            
            {/* Search results dropdown */}
            {searchResults.length > 0 && searchQuery.length >= 2 && (
              <Card className="absolute top-full left-0 right-0 mt-1 p-2 max-h-60 overflow-auto z-50">
                <ul>
                  {searchResults.map((result) => (
                    <li 
                      key={result.id} 
                      className="p-2 hover:bg-secondary/20 rounded-md cursor-pointer flex items-center gap-3"
                      onClick={() => {
                        setSelectedAsset(result);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      {result.thumb && (
                        <img src={result.thumb} alt={result.name} className="w-6 h-6 rounded-full" />
                      )}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-muted-foreground">{result.symbol}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - left side (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Asset selector */}
          <div className="flex overflow-x-auto pb-2 gap-2">
            {AVAILABLE_ASSETS.map((asset) => (
              <Button
                key={asset.id}
                variant={selectedAsset.id === asset.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAsset(asset)}
                className="whitespace-nowrap"
              >
                {asset.symbol} - {asset.name}
              </Button>
            ))}
          </div>
          
          {/* Chart card */}
          <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
            <div className="flex justify-between mb-4">
              <div className="flex space-x-2">
                <Button
                  variant={timeframe === "1d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("1d")}
                >
                  1D
                </Button>
                <Button
                  variant={timeframe === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("7d")}
                >
                  7D
                </Button>
                <Button
                  variant={timeframe === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("30d")}
                >
                  30D
                </Button>
                <Button
                  variant={timeframe === "90d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("90d")}
                >
                  90D
                </Button>
              </div>
            </div>
            
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] bg-secondary/5 rounded-lg">
                <div className="text-center">
                  <LoaderCircle className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            ) : (
              <Chart 
                data={chartData} 
                height={400} 
                symbol={selectedAsset.symbol} 
              />
            )}
          </div>
          
          {/* Order book */}
          <OrderBook 
            symbol={selectedAsset.symbol} 
            basePrice={marketData?.price || 0} 
          />
          
          {/* Recent orders */}
          {orders.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
              <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Symbol</th>
                      <th className="text-right py-2 font-medium">Price</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Total</th>
                      <th className="text-right py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={index} className="border-b border-border/20 hover:bg-secondary/5">
                        <td className={`py-2 ${order.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                          {order.type === 'buy' ? 'Buy' : 'Sell'} ({order.orderType})
                        </td>
                        <td className="py-2">{order.symbol}</td>
                        <td className="py-2 text-right font-mono">
                          ${order.price.toFixed(2)}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {order.quantity.toFixed(4)}
                        </td>
                        <td className="py-2 text-right font-mono">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          {order.timestamp.toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - right side (1 column) */}
        <div className="space-y-6">
          {/* Market info card */}
          <div className="rounded-lg border border-border/40 bg-secondary/10">
            <MarketInfo data={marketData} loading={loading} />
          </div>
          
          {/* Order form */}
          <MarketOrder 
            symbol={selectedAsset.symbol} 
            currentPrice={marketData?.price || 0} 
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default Trading;
