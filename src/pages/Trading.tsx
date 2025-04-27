
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Chart from "@/components/trading/Chart";
import MarketOrder, { OrderDetails } from "@/components/trading/MarketOrder";
import MarketInfo from "@/components/trading/MarketInfo";
import OrderBook from "@/components/trading/OrderBook";
import { fetchCryptoData, fetchCryptoHistoricalData, MarketData, CandleData } from "@/utils/marketData";
import { Bitcoin, Landmark, RefreshCcw } from "lucide-react";

const AVAILABLE_ASSETS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", type: "crypto" },
  { id: "solana", symbol: "SOL", name: "Solana", type: "crypto" },
  { id: "cardano", symbol: "ADA", name: "Cardano", type: "crypto" },
];

const Trading = () => {
  // States for the selected asset and time period
  const [selectedAsset, setSelectedAsset] = useState(AVAILABLE_ASSETS[0]);
  const [timeframe, setTimeframe] = useState("7d");
  
  // Market data states
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetails[]>([]);

  // Fetch market data when selected asset changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchCryptoData(selectedAsset.id);
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
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
      }
    };

    fetchHistorical();
  }, [selectedAsset, timeframe]);

  // Handle order placement
  const handlePlaceOrder = (order: OrderDetails) => {
    setOrders((prev) => [order, ...prev]);
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
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-display font-bold">Trading Dashboard</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
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
            
            <Chart 
              data={chartData} 
              height={400} 
              symbol={selectedAsset.symbol} 
            />
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
