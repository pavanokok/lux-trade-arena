
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
import { supabase } from "@/integrations/supabase/client";

const AVAILABLE_ASSETS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", type: "crypto" },
  { id: "solana", symbol: "SOL", name: "Solana", type: "crypto" },
  { id: "cardano", symbol: "ADA", name: "Cardano", type: "crypto" },
  { id: "ripple", symbol: "XRP", name: "XRP", type: "crypto" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", type: "crypto" },
  { id: "tesla", symbol: "TSLA", name: "Tesla", type: "stock" },
  { id: "apple", symbol: "AAPL", name: "Apple", type: "stock" },
  { id: "microsoft", symbol: "MSFT", name: "Microsoft", type: "stock" },
  { id: "tcs", symbol: "TCS", name: "Tata Consultancy Services", type: "stock" },
  { id: "infosys", symbol: "INFY", name: "Infosys", type: "stock" },
  { id: "hsbc", symbol: "HSBC", name: "HSBC Holdings", type: "stock" },
  { id: "bp", symbol: "BP", name: "BP plc", type: "stock" },
  { id: "sony", symbol: "SONY", name: "Sony Group", type: "stock" },
  { id: "toyota", symbol: "TM", name: "Toyota Motor", type: "stock" },
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
  const [userBalance, setUserBalance] = useState<number>(10000); // Default starting balance
  const [userPositions, setUserPositions] = useState<any[]>([]);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Update URL when selected asset changes
  useEffect(() => {
    navigate(`/trading?symbol=${selectedAsset.symbol}&id=${selectedAsset.id}`, { replace: true });
  }, [selectedAsset, navigate]);

  // Check if user is logged in and get their balance
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // Fetch user's balance
        const { data: userData, error } = await supabase
          .from('users')
          .select('virtual_balance')
          .eq('id', data.session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user balance:", error);
        } else if (userData) {
          setUserBalance(userData.virtual_balance || 10000);
        }
        
        // Fetch user's trades
        const { data: trades, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', data.session.user.id)
          .order('created_at', { ascending: false });
          
        if (tradesError) {
          console.error("Error fetching trades:", tradesError);
        } else if (trades) {
          setOrders(trades as Trade[]);
          
          // Calculate positions based on trades
          calculatePositions(trades as Trade[]);
        }
      } else {
        toast.error("Please log in to access full trading features");
        // Still allow demo trading without login
      }
    };
    
    checkUserAndFetchData();
  }, []);

  // Calculate user positions from trades
  const calculatePositions = (trades: Trade[]) => {
    const positions: Record<string, any> = {};
    
    trades.forEach(trade => {
      if (!positions[trade.symbol]) {
        positions[trade.symbol] = {
          symbol: trade.symbol,
          quantity: 0,
          totalCost: 0,
          type: 'long'
        };
      }
      
      const position = positions[trade.symbol];
      
      switch(trade.type) {
        case 'buy':
          position.quantity += trade.quantity;
          position.totalCost += trade.total;
          position.type = 'long';
          break;
        case 'sell':
          position.quantity -= trade.quantity;
          position.totalCost -= (position.totalCost / (position.quantity + trade.quantity)) * trade.quantity;
          break;
        case 'short':
          position.quantity -= trade.quantity; // Negative for shorts
          position.totalCost -= trade.total; // Credit for shorts
          position.type = 'short';
          break;
        case 'cover':
          position.quantity += trade.quantity;
          position.totalCost += trade.total;
          break;
      }
    });
    
    // Filter out closed positions (quantity = 0)
    const activePositions = Object.values(positions).filter((position: any) => position.quantity !== 0);
    setUserPositions(activePositions);
  };

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
  const handlePlaceOrder = async (order: Trade) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Please log in to place orders");
      navigate("/login");
      return;
    }
    
    // Check if user has enough balance for buy orders
    if ((order.type === 'buy' || order.type === 'cover') && order.total > userBalance) {
      toast.error(`Insufficient funds. You need $${order.total.toFixed(2)} but have $${userBalance.toFixed(2)}`);
      return;
    }
    
    // For sell orders, check if user has the assets (for long positions)
    if (order.type === 'sell') {
      const position = userPositions.find(p => p.symbol === order.symbol && p.type === 'long');
      if (!position || position.quantity < order.quantity) {
        toast.error(`You don't have enough ${order.symbol} to sell`);
        return;
      }
    }
    
    setOrders((prev) => [order, ...prev]);
    
    // Update user balance
    let newBalance = userBalance;
    if (order.type === 'buy' || order.type === 'cover') {
      newBalance -= order.total;
    } else if (order.type === 'sell' || order.type === 'short') {
      newBalance += order.total;
    }
    
    // Update the balance in Supabase
    const { error: balanceError } = await supabase
      .from('users')
      .update({ virtual_balance: newBalance })
      .eq('id', sessionData.session.user.id);
      
    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      toast.error('Error updating your balance');
      return;
    }
    
    setUserBalance(newBalance);
    
    // Show success notification
    toast.success(
      `${order.type === 'buy' ? 'Bought' : order.type === 'sell' ? 'Sold' : 
        order.type === 'short' ? 'Shorted' : 'Covered'} ${order.quantity} ${order.symbol} at $${order.price.toFixed(2)}`,
      {
        description: `Total: $${order.total.toFixed(2)}`
      }
    );
    
    // Recalculate positions
    calculatePositions([...orders, order]);
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
          
          {/* Sidebar layout rearrangement - Move Market Order up in mobile view */}
          <div className="block lg:hidden">
            {/* Order form */}
            <MarketOrder 
              symbol={selectedAsset.symbol} 
              currentPrice={marketData?.price || 0}
              userBalance={userBalance}
              userPositions={userPositions}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
          
          {/* Trading positions */}
          {userPositions.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
              <h3 className="text-lg font-medium mb-4">Open Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 font-medium">Symbol</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-right py-2 font-medium">Quantity</th>
                      <th className="text-right py-2 font-medium">Avg. Price</th>
                      <th className="text-right py-2 font-medium">Current Price</th>
                      <th className="text-right py-2 font-medium">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPositions.map((position, index) => {
                      // Get current price from market data or use last known price
                      const currentPrice = (selectedAsset.symbol === position.symbol && marketData?.price) 
                        ? marketData.price 
                        : position.currentPrice || 0;
                      
                      // Calculate P&L based on position type (long/short)
                      const avgPrice = position.totalCost / Math.abs(position.quantity);
                      const isLong = position.type === 'long';
                      const pnl = isLong 
                        ? (currentPrice - avgPrice) * position.quantity
                        : (avgPrice - currentPrice) * Math.abs(position.quantity);
                      
                      return (
                        <tr key={index} className="border-b border-border/20 hover:bg-secondary/5">
                          <td className="py-2">{position.symbol}</td>
                          <td className={`py-2 ${isLong ? 'text-success' : 'text-destructive'}`}>
                            {isLong ? 'Long' : 'Short'}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {Math.abs(position.quantity).toFixed(4)}
                          </td>
                          <td className="py-2 text-right font-mono">
                            ${avgPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right font-mono">
                            ${currentPrice.toFixed(2)}
                          </td>
                          <td className={`py-2 text-right font-mono ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            ${pnl.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
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
                        <td className={`py-2 ${
                          order.type === 'buy' ? 'text-success' : 
                          order.type === 'sell' ? 'text-destructive' :
                          order.type === 'short' ? 'text-destructive' : 'text-success'
                        }`}>
                          {order.type === 'buy' ? 'Buy' : 
                           order.type === 'sell' ? 'Sell' :
                           order.type === 'short' ? 'Short' : 'Cover'} ({order.order_type})
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
                          {new Date(order.created_at).toLocaleTimeString()}
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
          {/* Available balance */}
          <div className="rounded-lg border border-border/40 bg-secondary/10 p-6">
            <h3 className="text-lg font-medium mb-2">Available Balance</h3>
            <p className="text-3xl font-mono font-bold">${userBalance.toFixed(2)}</p>
          </div>
          
          {/* Market info card */}
          <div className="rounded-lg border border-border/40 bg-secondary/10">
            <MarketInfo data={marketData} loading={loading} />
          </div>
          
          {/* Order form - hide in mobile view as it's moved up */}
          <div className="hidden lg:block">
            <MarketOrder 
              symbol={selectedAsset.symbol} 
              currentPrice={marketData?.price || 0}
              userBalance={userBalance}
              userPositions={userPositions}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
