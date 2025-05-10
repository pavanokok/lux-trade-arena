
import { useMemo } from 'react';
import { Trade } from '@/types/trade';
import { formatPrice } from '@/utils/marketData';

interface TradeMarkerProps {
  trade: Trade;
  chartWidth: number;
  chartHeight: number;
  minTime: number;
  maxTime: number;
  maxPrice: number;
  minPrice: number;
}

const TradeMarker = ({ 
  trade, 
  chartWidth, 
  chartHeight,
  minTime, 
  maxTime,
  maxPrice,
  minPrice
}: TradeMarkerProps) => {
  const entryTimestamp = new Date(trade.entry_timestamp || trade.created_at).getTime();
  const closeTimestamp = trade.close_timestamp ? new Date(trade.close_timestamp).getTime() : Date.now();
  
  // Calculate x position based on timestamp
  const xPosition = useMemo(() => {
    const timeRange = maxTime - minTime;
    if (timeRange <= 0) return 0;
    
    const normalizedTime = (entryTimestamp - minTime) / timeRange;
    return normalizedTime * chartWidth;
  }, [entryTimestamp, minTime, maxTime, chartWidth]);
  
  // Calculate y position based on price
  const yPosition = useMemo(() => {
    const priceRange = maxPrice - minPrice;
    if (priceRange <= 0) return 0;
    
    const normalizedPrice = (trade.price - minPrice) / priceRange;
    // Inverse y-axis (higher price = lower y-coordinate)
    return chartHeight - (normalizedPrice * chartHeight);
  }, [trade.price, minPrice, maxPrice, chartHeight]);
  
  // Determine if the trade was a win or loss
  const isWin = trade.is_closed && trade.realized_pnl !== undefined ? 
    trade.realized_pnl > 0 : false;
    
  // Only show closed trades with results
  if (!trade.is_closed || trade.realized_pnl === undefined) return null;
  
  // Calculate profit percentage
  const profitPercent = trade.realized_pnl !== undefined && trade.total > 0 
    ? (trade.realized_pnl / trade.total) * 100 
    : 0;
  
  return (
    <div 
      className="absolute pointer-events-none animate-fade-in" 
      style={{ 
        left: `${xPosition}px`, 
        top: 0,
        height: '100%',
        zIndex: 10
      }}
    >
      {/* Vertical marker line */}
      <div className="w-0.5 h-full bg-yellow-500 opacity-70" />
      
      {/* Trade result indicator */}
      <div 
        className={`absolute transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold ${
          isWin ? 'bg-success/70 text-success-foreground' : 'bg-destructive/70 text-destructive-foreground'
        } animate-scale-in`}
        style={{ top: `${yPosition}px` }}
      >
        {isWin ? 'WIN' : 'LOSS'} {formatPrice(trade.realized_pnl || 0)} 
        <span className="ml-1">({profitPercent.toFixed(1)}%)</span>
      </div>
    </div>
  );
};

export default TradeMarker;
