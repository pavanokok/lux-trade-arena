import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RefreshCcw, Loader2 } from "lucide-react";
import { formatPrice, formatPercentage, fetchCryptoData } from "@/utils/marketData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trade } from "@/types/trade";
import type { Database } from "@/integrations/supabase/types";

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

const Portfolio = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalPnlPercent, setTotalPnlPercent] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please log in to view your portfolio");
        navigate("/login");
      }
    };
    
    checkUser();
  }, [navigate]);
  
  useEffect(() => {
    const fetchUserTrades = async () => {
      setLoading(true);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;
        
        const { data: trades, error } = await supabase
          .from('trades')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (trades) {
          setRecentTrades(trades as Trade[]);
          
          const portfolioMap = new Map<string, { 
            id: string, 
            symbol: string,
            name: string,
            quantity: number, 
            totalCost: number 
          }>();
          
          trades.forEach((trade: Trade) => {
            const symbol = trade.symbol;
            
            if (!portfolioMap.has(symbol)) {
              portfolioMap.set(symbol, {
                id: symbol.toLowerCase(),
                symbol,
                name: symbol,
                quantity: 0,
                totalCost: 0
              });
            }
            
            const position = portfolioMap.get(symbol)!;
            
            if (trade.type === 'buy') {
              position.quantity += trade.quantity;
              position.totalCost += trade.total;
            } else {
              position.quantity -= trade.quantity;
              position.totalCost -= (position.totalCost / (position.quantity + trade.quantity)) * trade.quantity;
            }
          });
          
          const positions = Array.from(portfolioMap.values()).filter(p => p.quantity > 0);
          
          const updatedAssets = await Promise.all(positions.map(async (position) => {
            try {
              const marketData = await fetchCryptoData(position.id);
              const currentPrice = marketData?.price || 0;
              const totalValue = position.quantity * currentPrice;
              const avgBuyPrice = position.quantity > 0 ? position.totalCost / position.quantity : 0;
              const pnl = totalValue - position.totalCost;
              const pnlPercent = position.totalCost > 0 ? (pnl / position.totalCost) * 100 : 0;
              
              return {
                id: position.id,
                symbol: position.symbol,
                name: position.name,
                quantity: position.quantity,
                avgBuyPrice,
                currentPrice,
                totalValue,
                pnl,
                pnlPercent
              };
            } catch (error) {
              console.error(`Error fetching price for ${position.symbol}:`, error);
              return {
                id: position.id,
                symbol: position.symbol,
                name: position.symbol,
                quantity: position.quantity,
                avgBuyPrice: position.quantity > 0 ? position.totalCost / position.quantity : 0,
                currentPrice: 0,
                totalValue: 0,
                pnl: 0,
                pnlPercent: 0
              };
            }
          }));
          
          const totalVal = updatedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
          const totalCost = updatedAssets.reduce((sum, asset) => sum + (asset.avgBuyPrice * asset.quantity), 0);
          const totalPnlVal = totalVal - totalCost;
          const totalPnlPercentVal = totalCost > 0 ? (totalPnlVal / totalCost) * 100 : 0;
          
          setAssets(updatedAssets);
          setTotalValue(totalVal);
          setTotalPnl(totalPnlVal);
          setTotalPnlPercent(totalPnlPercentVal);
        } else {
          setAssets([]);
          setTotalValue(0);
          setTotalPnl(0);
          setTotalPnlPercent(0);
        }
      } catch (error: any) {
        console.error("Error fetching portfolio data:", error);
        toast.error("Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserTrades();
  }, []);
  
  const handleRefresh = () => {
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const updatedAssets = await Promise.all(assets.map(async (asset) => {
          const marketData = await fetchCryptoData(asset.id);
          const currentPrice = marketData?.price || 0;
          const totalValue = asset.quantity * currentPrice;
          const pnl = totalValue - (asset.avgBuyPrice * asset.quantity);
          const pnlPercent = (asset.avgBuyPrice > 0) ? (pnl / (asset.avgBuyPrice * asset.quantity)) * 100 : 0;
          
          return {
            ...asset,
            currentPrice,
            totalValue,
            pnl,
            pnlPercent
          };
        }));
        
        const totalVal = updatedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
        const totalCost = updatedAssets.reduce((sum, asset) => sum + (asset.avgBuyPrice * asset.quantity), 0);
        const totalPnlVal = totalVal - totalCost;
        const totalPnlPercentVal = totalCost > 0 ? (totalPnlVal / totalCost) * 100 : 0;
        
        setAssets(updatedAssets);
        setTotalValue(totalVal);
        setTotalPnl(totalPnlVal);
        setTotalPnlPercent(totalPnlPercentVal);
        
        toast.success("Portfolio refreshed with latest prices");
      } catch (error) {
        console.error("Error refreshing prices:", error);
        toast.error("Failed to refresh portfolio data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your trading performance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh Prices
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Portfolio Value</CardDescription>
            <CardTitle className="text-2xl font-mono">{formatPrice(totalValue)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total P&L</CardDescription>
            <CardTitle className={`text-2xl font-mono flex items-center ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              {formatPrice(totalPnl)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Return</CardDescription>
            <CardTitle className={`text-2xl font-mono flex items-center ${totalPnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnlPercent >= 0 ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              {formatPercentage(totalPnlPercent)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current asset positions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any assets yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/trading')}>
                Start Trading
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 font-medium">Asset</th>
                    <th className="text-right py-3 font-medium">Quantity</th>
                    <th className="text-right py-3 font-medium">Avg Price</th>
                    <th className="text-right py-3 font-medium">Current Price</th>
                    <th className="text-right py-3 font-medium">Value</th>
                    <th className="text-right py-3 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-border/20 hover:bg-secondary/5">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-xs font-medium">{asset.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-xs text-muted-foreground uppercase">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 font-mono">
                        {asset.quantity.toFixed(asset.quantity < 1 ? 6 : 2)}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {formatPrice(asset.avgBuyPrice)}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {formatPrice(asset.currentPrice)}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {formatPrice(asset.totalValue)}
                      </td>
                      <td className={`text-right py-3 ${asset.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        <div className="flex items-center justify-end">
                          {asset.pnl >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {formatPrice(asset.pnl)} ({formatPercentage(asset.pnlPercent)})
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {recentTrades.length > 0 && (
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-left py-3 font-medium">Symbol</th>
                    <th className="text-right py-3 font-medium">Price</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                    <th className="text-right py-3 font-medium">Total</th>
                    <th className="text-right py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/20 hover:bg-secondary/5">
                      <td className={`py-2 ${trade.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                        {trade.type === 'buy' ? 'Buy' : 'Sell'}
                      </td>
                      <td className="py-2">{trade.symbol}</td>
                      <td className="py-2 text-right font-mono">
                        ${trade.price.toFixed(2)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {trade.quantity.toFixed(4)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        ${trade.total.toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        {new Date(trade.created_at).toLocaleDateString()} {new Date(trade.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Portfolio;
