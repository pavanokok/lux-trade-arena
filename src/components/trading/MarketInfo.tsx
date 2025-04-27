
import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatPrice, formatPercentage, MarketData } from '@/utils/marketData';

interface MarketInfoProps {
  data: MarketData | null;
  loading: boolean;
}

const MarketInfo = ({ data, loading }: MarketInfoProps) => {
  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-4 p-6">
        <div className="flex space-x-4">
          <div className="h-6 bg-secondary/40 rounded w-24"></div>
          <div className="h-6 bg-secondary/40 rounded w-40"></div>
        </div>
        <div className="h-12 bg-secondary/40 rounded w-36"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-6 bg-secondary/40 rounded"></div>
          <div className="h-6 bg-secondary/40 rounded"></div>
          <div className="h-6 bg-secondary/40 rounded"></div>
          <div className="h-6 bg-secondary/40 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <p className="text-muted-foreground">No market data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-baseline">
        <h3 className="text-xl font-semibold mr-2">{data.symbol}/USD</h3>
        <span className="text-sm text-muted-foreground">{data.symbol}</span>
      </div>

      <div className="flex items-center space-x-2 my-3">
        <span className="text-3xl font-mono font-medium">{formatPrice(data.price)}</span>
        <span 
          className={`flex items-center ${data.changePercent >= 0 ? 'text-success' : 'text-destructive'}`}
        >
          {data.changePercent >= 0 ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          {formatPercentage(data.changePercent)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">24h High</p>
          <p className="font-mono">{formatPrice(data.high)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">24h Low</p>
          <p className="font-mono">{formatPrice(data.low)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">24h Volume</p>
          <p className="font-mono">{data.volume}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <p className="font-mono">{data.marketCap}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketInfo;
