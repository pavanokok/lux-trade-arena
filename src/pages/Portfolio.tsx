
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RefreshCcw, Loader2, AlertCircle } from "lucide-react";
import { 
  formatPrice, 
  formatPercentage, 
  getAssetCurrentPrice, 
  getAssetInfo,
  AssetType
} from "@/utils/marketData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trade, Position } from "@/types/trade";
import PositionCloseModal from "@/components/trading/PositionCloseModal";

const Portfolio = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalPnlPercent, setTotalPnlPercent] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const navigate = useNavigate();
  
  // Position close modal
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
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
    fetchUserPortfolio();
  }, []);
  
  const fetchUserPortfolio = async () => {
    setLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      
      // Fetch user trades
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tradesError) throw tradesError;
      
      if (trades) {
        setRecentTrades(trades as Trade[]);
        
        // Process trades to calculate positions
        const positions = await processTradesIntoPositions(trades as Trade[]);
        setPositions(positions);
        
        // Calculate portfolio totals - only include positions with valid currentPrice
        const validPositions = positions.filter(pos => pos.currentPrice !== null);
        const totalVal = validPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
        
        const totalCost = validPositions.reduce((sum, pos) => {
          if (pos.type === 'long') {
            return sum + (pos.avgBuyPrice * pos.quantity);
          } else {
            // For short positions, cost basis is calculated differently
            return sum + (pos.avgBuyPrice * Math.abs(pos.quantity));
          }
        }, 0);
        
        const totalPnlVal = validPositions.reduce((sum, pos) => sum + pos.pnl, 0);
        const totalPnlPercentVal = totalCost > 0 ? (totalPnlVal / totalCost) * 100 : 0;
        
        setTotalValue(totalVal);
        setTotalPnl(totalPnlVal);
        setTotalPnlPercent(totalPnlPercentVal);
      }
    } catch (error: any) {
      console.error("Error fetching portfolio data:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const processTradesIntoPositions = async (trades: Trade[]): Promise<Position[]> => {
    // Filter out short-term trades as they don't affect positions
    const positionTrades = trades.filter(
      trade => !["short_term_up", "short_term_down"].includes(trade.type)
    );
    
    const posMap = new Map<string, { 
      symbol: string,
      name: string,
      quantity: number, 
      totalCost: number,
      type: 'long' | 'short',
      assetType: AssetType,
      entryTimestamp?: string,
      tradeIds: string[]
    }>();
    
    // Process trades to build positions
    for (const trade of positionTrades) {
      // Skip closed trades
      if (trade.is_closed) continue;
      
      const symbol = trade.symbol;
      const mapKey = `${symbol}-${trade.type === 'buy' || trade.type === 'cover' ? 'long' : 'short'}`;
      
      // Get asset info including name and type
      const assetInfo = getAssetInfo(symbol);
      const assetName = assetInfo?.name || symbol;
      const assetType = assetInfo?.type || AssetType.CRYPTO;
      
      if (!posMap.has(mapKey)) {
        posMap.set(mapKey, {
          symbol,
          name: assetName,
          quantity: 0,
          totalCost: 0,
          type: trade.type === 'buy' || trade.type === 'cover' ? 'long' : 'short',
          assetType,
          entryTimestamp: trade.created_at,
          tradeIds: []
        });
      }
      
      const position = posMap.get(mapKey)!;
      
      // Add trade ID to this position
      if (!position.tradeIds.includes(trade.id)) {
        position.tradeIds.push(trade.id);
      }
      
      if (trade.type === 'buy') {
        position.quantity += trade.quantity;
        position.totalCost += trade.total;
        if (!position.entryTimestamp || new Date(trade.created_at) < new Date(position.entryTimestamp)) {
          position.entryTimestamp = trade.created_at;
        }
      } 
      else if (trade.type === 'sell') {
        position.quantity -= trade.quantity;
        position.totalCost -= (position.totalCost / (position.quantity + trade.quantity)) * trade.quantity;
      }
      else if (trade.type === 'short') {
        position.quantity -= trade.quantity; // Negative for shorts
        position.totalCost += trade.total; // Money received
        if (!position.entryTimestamp || new Date(trade.created_at) < new Date(position.entryTimestamp)) {
          position.entryTimestamp = trade.created_at;
        }
      }
      else if (trade.type === 'cover') {
        position.quantity += trade.quantity; // Reducing the short position
        position.totalCost -= trade.total; // Money paid to cover
      }
    }
    
    // Remove closed positions (quantity = 0)
    for (const [key, position] of posMap.entries()) {
      if (Math.abs(position.quantity) < 0.00000001) {
        posMap.delete(key);
      }
    }
    
    // Convert to Position objects with current prices
    const positions: Position[] = [];
    
    for (const position of posMap.values()) {
      // Skip positions with zero quantity
      if (Math.abs(position.quantity) < 0.00000001) continue;
      
      try {
        // Fetch current price for the asset - with better error handling
        const currentPrice = await getAssetCurrentPrice(position.symbol);
        
        const avgBuyPrice = Math.abs(position.quantity) > 0 ? 
          Math.abs(position.totalCost / position.quantity) : 0;
        
        let totalValue = 0;
        let pnl = 0;
        let pnlPercent = 0;
        
        if (currentPrice !== null) {
          if (position.type === 'long') {
            totalValue = position.quantity * currentPrice;
            pnl = totalValue - position.totalCost;
            pnlPercent = position.totalCost > 0 ? (pnl / position.totalCost) * 100 : 0;
          } else {
            // For short positions
            const originalValue = Math.abs(position.quantity) * avgBuyPrice;
            const currentValue = Math.abs(position.quantity) * currentPrice;
            totalValue = currentValue;
            pnl = originalValue - currentValue; // Profit if current value is less than original
            pnlPercent = originalValue > 0 ? (pnl / originalValue) * 100 : 0;
          }
        }
        
        positions.push({
          symbol: position.symbol,
          name: position.name,
          quantity: position.quantity,
          avgBuyPrice,
          currentPrice,
          totalValue,
          pnl,
          pnlPercent,
          type: position.type,
          assetType: position.assetType,
          entryTimestamp: position.entryTimestamp,
          tradeIds: position.tradeIds
        });
      } catch (error) {
        console.error(`Error processing position for ${position.symbol}:`, error);
        // Add the position with null price to still show it in the UI
        positions.push({
          symbol: position.symbol,
          name: position.name,
          quantity: position.quantity,
          avgBuyPrice: Math.abs(position.totalCost / position.quantity),
          currentPrice: null,
          totalValue: 0,
          pnl: 0,
          pnlPercent: 0,
          type: position.type,
          assetType: position.assetType,
          entryTimestamp: position.entryTimestamp,
          tradeIds: position.tradeIds
        });
      }
    }
    
    return positions;
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await fetchUserPortfolio();
      toast.success("Portfolio refreshed with latest prices");
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
      toast.error("Failed to refresh portfolio data");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle opening the close position modal
  const handleOpenCloseModal = (position: Position) => {
    setSelectedPosition(position);
    setIsCloseModalOpen(true);
  };

  // Handle position close completion
  const handlePositionClosed = () => {
    fetchUserPortfolio();
  };

  // Filter trades for history display
  const getCompletedTrades = useCallback(() => {
    // Return trades that are closed or short-term trades
    return recentTrades.filter(trade => 
      trade.is_closed || 
      trade.type === 'short_term_up' || 
      trade.type === 'short_term_down'
    );
  }, [recentTrades]);

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your trading performance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || refreshing}>
          {(loading || refreshing) ? (
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
                <div key={i} className="grid grid-cols-7 gap-4">
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-secondary/40 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : positions.length === 0 ? (
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
                    <th className="text-right py-3 font-medium">Type</th>
                    <th className="text-right py-3 font-medium">Quantity</th>
                    <th className="text-right py-3 font-medium">Avg Price</th>
                    <th className="text-right py-3 font-medium">Current Price</th>
                    <th className="text-right py-3 font-medium">Value</th>
                    <th className="text-right py-3 font-medium">P&L</th>
                    <th className="text-right py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={`${position.symbol}-${position.type}`} className="border-b border-border/20 hover:bg-secondary/5">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-xs font-medium">{position.symbol.substring(0, 3)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{position.name}</p>
                            <p className="text-xs text-muted-foreground uppercase">
                              {position.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`text-right py-3 ${position.type === 'long' ? 'text-success' : 'text-destructive'}`}>
                        {position.type === 'long' ? 'LONG' : 'SHORT'}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {Math.abs(position.quantity).toFixed(position.quantity < 1 ? 8 : 4)}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {formatPrice(position.avgBuyPrice)}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {position.currentPrice !== null ? (
                          formatPrice(position.currentPrice)
                        ) : (
                          <div className="flex items-center justify-end text-amber-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Refreshing...</span>
                          </div>
                        )}
                      </td>
                      <td className="text-right py-3 font-mono">
                        {position.currentPrice !== null ? formatPrice(position.totalValue) : 'Loading...'}
                      </td>
                      <td className={`text-right py-3 ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {position.currentPrice !== null ? (
                          <div className="flex items-center justify-end">
                            {position.pnl >= 0 ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPrice(position.pnl)} ({formatPercentage(position.pnlPercent)})
                          </div>
                        ) : 'Loading...'}
                      </td>
                      <td className="text-right py-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenCloseModal(position)}
                        >
                          Close
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {getCompletedTrades().length > 0 && (
        <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>Your completed trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-left py-3 font-medium">Symbol</th>
                    <th className="text-right py-3 font-medium">Entry Price</th>
                    <th className="text-right py-3 font-medium">Exit Price</th>
                    <th className="text-right py-3 font-medium">Quantity</th>
                    <th className="text-right py-3 font-medium">P&L</th>
                    <th className="text-right py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {getCompletedTrades().map((trade) => (
                    <tr key={trade.id} className="border-b border-border/20 hover:bg-secondary/5">
                      <td className={`py-2 ${
                        trade.type === 'buy' || trade.type === 'short_term_up' ? 'text-success' : 
                        trade.type === 'sell' || trade.type === 'short_term_down' ? 'text-destructive' :
                        trade.type === 'short' ? 'text-destructive' : 'text-success'
                      }`}>
                        {trade.type === 'short_term_up' ? 'UP' : 
                         trade.type === 'short_term_down' ? 'DOWN' :
                         trade.type === 'buy' ? 'Buy' : 
                         trade.type === 'sell' ? 'Sell' :
                         trade.type === 'short' ? 'Short' : 'Cover'}
                      </td>
                      <td className="py-2">{trade.symbol}</td>
                      <td className="py-2 text-right font-mono">
                        {formatPrice(trade.price)}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {trade.close_price ? formatPrice(trade.close_price) : '-'}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {trade.quantity.toFixed(8)}
                      </td>
                      <td className={`py-2 text-right font-mono ${
                        (trade.realized_pnl || 0) >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {trade.realized_pnl !== undefined ? formatPrice(trade.realized_pnl) : '-'}
                      </td>
                      <td className="py-2 text-right">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position close modal */}
      <PositionCloseModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        position={selectedPosition}
        currentPrice={selectedPosition?.currentPrice || 0}
        onPositionClosed={handlePositionClosed}
      />
    </div>
  );
};

export default Portfolio;
