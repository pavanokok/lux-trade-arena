
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Bitcoin, Landmark, RefreshCcw, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, formatPercentage } from "@/utils/marketData";
import axios from "axios";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
}

const Markets = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch crypto market data from CoinGecko
  const fetchCryptoMarkets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h"
      );
      setCryptoAssets(response.data);
    } catch (error) {
      console.error("Error fetching crypto markets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoMarkets();
  }, []);

  // Filter assets based on search term
  const filteredAssets = cryptoAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Markets Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze real-time market data for cryptocurrencies
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
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

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchCryptoMarkets}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
        <Tabs defaultValue="all" className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Markets</CardTitle>
              <div className="flex gap-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="gainers">Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Losers</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <CardDescription>
              Last updated: {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="all">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 font-medium">#</th>
                      <th className="text-left py-3 font-medium">Asset</th>
                      <th className="text-right py-3 font-medium">Price</th>
                      <th className="text-right py-3 font-medium">24h Change</th>
                      <th className="text-right py-3 font-medium">Market Cap</th>
                      <th className="text-right py-3 font-medium">Volume (24h)</th>
                      <th className="text-right py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={`skeleton-${index}`} className="border-b border-border/20">
                          <td className="py-3">
                            <div className="h-5 w-5 bg-secondary/40 rounded animate-pulse"></div>
                          </td>
                          <td className="py-3 flex items-center gap-2">
                            <div className="h-8 w-8 bg-secondary/40 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-20 bg-secondary/40 rounded animate-pulse"></div>
                              <div className="h-3 w-12 bg-secondary/40 rounded animate-pulse"></div>
                            </div>
                          </td>
                          <td className="text-right py-3">
                            <div className="h-4 w-24 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="text-right py-3">
                            <div className="h-4 w-16 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="text-right py-3">
                            <div className="h-4 w-24 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="text-right py-3">
                            <div className="h-4 w-20 bg-secondary/40 rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="text-right py-3">
                            <div className="h-8 w-8 bg-secondary/40 rounded-full animate-pulse ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No assets found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset, index) => (
                        <tr key={asset.id} className="border-b border-border/20 hover:bg-secondary/5">
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={asset.image}
                                alt={asset.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground uppercase">
                                  {asset.symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 font-mono">
                            {formatPrice(asset.current_price)}
                          </td>
                          <td className={`text-right py-3 ${asset.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            <div className="flex items-center justify-end">
                              {asset.price_change_percentage_24h >= 0 ? (
                                <ArrowUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1" />
                              )}
                              {formatPercentage(asset.price_change_percentage_24h)}
                            </div>
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.market_cap)}
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.total_volume)}
                          </td>
                          <td className="text-right py-3">
                            <Link to={`/trading?symbol=${asset.symbol}&id=${asset.id}`}>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="gainers">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 font-medium">#</th>
                      <th className="text-left py-3 font-medium">Asset</th>
                      <th className="text-right py-3 font-medium">Price</th>
                      <th className="text-right py-3 font-medium">24h Change</th>
                      <th className="text-right py-3 font-medium">Market Cap</th>
                      <th className="text-right py-3 font-medium">Volume (24h)</th>
                      <th className="text-right py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets
                      .filter(asset => asset.price_change_percentage_24h > 0)
                      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                      .map((asset, index) => (
                        <tr key={asset.id} className="border-b border-border/20 hover:bg-secondary/5">
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={asset.image}
                                alt={asset.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground uppercase">
                                  {asset.symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 font-mono">
                            {formatPrice(asset.current_price)}
                          </td>
                          <td className="text-right py-3 text-success">
                            <div className="flex items-center justify-end">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {formatPercentage(asset.price_change_percentage_24h)}
                            </div>
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.market_cap)}
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.total_volume)}
                          </td>
                          <td className="text-right py-3">
                            <Link to={`/trading?symbol=${asset.symbol}&id=${asset.id}`}>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="losers">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 font-medium">#</th>
                      <th className="text-left py-3 font-medium">Asset</th>
                      <th className="text-right py-3 font-medium">Price</th>
                      <th className="text-right py-3 font-medium">24h Change</th>
                      <th className="text-right py-3 font-medium">Market Cap</th>
                      <th className="text-right py-3 font-medium">Volume (24h)</th>
                      <th className="text-right py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets
                      .filter(asset => asset.price_change_percentage_24h < 0)
                      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                      .map((asset, index) => (
                        <tr key={asset.id} className="border-b border-border/20 hover:bg-secondary/5">
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={asset.image}
                                alt={asset.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground uppercase">
                                  {asset.symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 font-mono">
                            {formatPrice(asset.current_price)}
                          </td>
                          <td className="text-right py-3 text-destructive">
                            <div className="flex items-center justify-end">
                              <ArrowDown className="h-3 w-3 mr-1" />
                              {formatPercentage(Math.abs(asset.price_change_percentage_24h))}
                            </div>
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.market_cap)}
                          </td>
                          <td className="text-right py-3">
                            {formatPrice(asset.total_volume)}
                          </td>
                          <td className="text-right py-3">
                            <Link to={`/trading?symbol=${asset.symbol}&id=${asset.id}`}>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Markets;
