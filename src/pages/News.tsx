
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Newspaper, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  relatedAssets: string[];
  imageUrl?: string;
}

const News = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'crypto' | 'markets' | 'business'>('crypto');

  // Mock news data
  useEffect(() => {
    const fetchNews = () => {
      setLoading(true);
      
      // In a real app, this would be an API call to fetch real news
      setTimeout(() => {
        const mockNews: NewsItem[] = [
          {
            id: "1",
            title: "Bitcoin Surges Past $58,000 as ETF Demand Grows",
            summary: "Bitcoin's price has surpassed $58,000 for the first time in weeks, driven by increased demand for spot ETFs and institutional adoption.",
            source: "CryptoNews",
            url: "#",
            publishedAt: "2025-04-27T09:30:00Z",
            relatedAssets: ["BTC", "ETH"],
            imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          },
          {
            id: "2",
            title: "Ethereum Developers Announce Major Protocol Update",
            summary: "Ethereum developers have scheduled a significant protocol update that aims to improve scalability and reduce gas fees across the network.",
            source: "BlockchainDaily",
            url: "#",
            publishedAt: "2025-04-26T14:45:00Z",
            relatedAssets: ["ETH"]
          },
          {
            id: "3",
            title: "SEC Provides Regulatory Clarity for Crypto Exchanges",
            summary: "The Securities and Exchange Commission has released new guidelines providing clarity on how cryptocurrency exchanges should operate in compliance with federal laws.",
            source: "FinanceToday",
            url: "#",
            publishedAt: "2025-04-25T18:20:00Z",
            relatedAssets: ["BTC", "ETH", "SOL"]
          },
          {
            id: "4",
            title: "Central Banks Exploring Digital Currencies in Response to Crypto Growth",
            summary: "Several central banks around the world are accelerating their development of central bank digital currencies (CBDCs) as cryptocurrency adoption continues to grow.",
            source: "GlobalEconomics",
            url: "#",
            publishedAt: "2025-04-24T11:10:00Z",
            relatedAssets: []
          },
          {
            id: "5",
            title: "Solana Network Achieves New Transaction Processing Record",
            summary: "The Solana blockchain has set a new record for transaction processing, handling over 100,000 transactions per second during a recent network test.",
            source: "TechCrypto",
            url: "#",
            publishedAt: "2025-04-23T20:15:00Z",
            relatedAssets: ["SOL"]
          }
        ];
        
        setNewsItems(mockNews);
        setLoading(false);
      }, 1000);
    };
    
    fetchNews();
  }, [category]);
  
  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would fetch fresh news data
    setTimeout(() => {
      setLoading(false);
      toast("News feed refreshed with latest articles");
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Market News</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest financial market news
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={category === 'crypto' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCategory('crypto')}
          >
            Crypto
          </Button>
          <Button 
            variant={category === 'markets' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCategory('markets')}
          >
            Markets
          </Button>
          <Button 
            variant={category === 'business' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCategory('business')}
          >
            Business
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40 bg-secondary/10 backdrop-blur-sm w-full">
              <div className="p-6">
                <div className="h-8 bg-secondary/40 rounded animate-pulse w-3/4 mb-3"></div>
                <div className="h-4 bg-secondary/40 rounded animate-pulse w-1/4 mb-6"></div>
                <div className="h-4 bg-secondary/40 rounded animate-pulse w-full mb-2"></div>
                <div className="h-4 bg-secondary/40 rounded animate-pulse w-full mb-2"></div>
                <div className="h-4 bg-secondary/40 rounded animate-pulse w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="border-border/40 bg-secondary/10 backdrop-blur-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {item.imageUrl && (
                  <div className="md:w-1/4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="h-48 md:h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div className={`p-6 ${item.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.source}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.summary}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {item.relatedAssets.map((asset) => (
                        <span key={asset} className="inline-block bg-secondary/40 px-2 py-1 rounded text-xs">
                          {asset}
                        </span>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        Read more <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
