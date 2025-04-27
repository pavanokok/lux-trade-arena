
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RefreshCcw } from "lucide-react";
import { formatPrice, formatPercentage } from "@/utils/marketData";
import { toast } from "sonner";

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
  
  // Mock portfolio data - in a real app, this would come from a database
  useEffect(() => {
    const mockPortfolio = [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        quantity: 0.25,
        avgBuyPrice: 54000,
        currentPrice: 56842.12,
        totalValue: 0,
        pnl: 0,
        pnlPercent: 0
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        quantity: 2.5,
        avgBuyPrice: 3100,
        currentPrice: 3245.67,
        totalValue: 0,
        pnl: 0,
        pnlPercent: 0
      },
      {
        id: "solana",
        symbol: "SOL",
        name: "Solana",
        quantity: 15,
        avgBuyPrice: 118,
        currentPrice: 123.45,
        totalValue: 0,
        pnl: 0,
        pnlPercent: 0
      }
    ];
    
    // Calculate derived values
    const updatedAssets = mockPortfolio.map(asset => {
      const totalValue = asset.quantity * asset.currentPrice;
      const totalCost = asset.quantity * asset.avgBuyPrice;
      const pnl = totalValue - totalCost;
      const pnlPercent = (pnl / totalCost) * 100;
      
      return {
        ...asset,
        totalValue,
        pnl,
        pnlPercent
      };
    });
    
    // Calculate totals
    const totalVal = updatedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalCost = updatedAssets.reduce((sum, asset) => sum + (asset.quantity * asset.avgBuyPrice), 0);
    const totalPnlVal = totalVal - totalCost;
    const totalPnlPercentVal = (totalPnlVal / totalCost) * 100;
    
    setAssets(updatedAssets);
    setTotalValue(totalVal);
    setTotalPnl(totalPnlVal);
    setTotalPnlPercent(totalPnlPercentVal);
    setLoading(false);
  }, []);
  
  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would fetch fresh price data
    setTimeout(() => {
      setLoading(false);
      toast("Portfolio refreshed with latest prices");
    }, 1000);
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your mock trading performance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
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
      
      <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
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
    </div>
  );
};

export default Portfolio;
