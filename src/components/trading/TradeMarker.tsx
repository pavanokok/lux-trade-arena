
import { useMemo } from 'react';
import { Trade } from '@/types/trade';
import { formatPrice } from '@/utils/marketData';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
  
  // Format the trade result text
  const resultText = isWin 
    ? `+${formatPrice(trade.realized_pnl || 0)} (${profitPercent.toFixed(1)}%)`
    : `-${formatPrice(Math.abs(trade.realized_pnl || 0))} (${profitPercent.toFixed(1)}%)`;
  
  // Determine the trade type for display
  const tradeTypeDisplay = (() => {
    if (trade.type === 'short_term_up') return 'UP';
    if (trade.type === 'short_term_down') return 'DOWN';
    if (trade.type === 'buy') return 'BUY';
    if (trade.type === 'sell') return 'SELL';
    if (trade.type === 'short') return 'SHORT';
    if (trade.type === 'cover') return 'COVER';
    return trade.type.toUpperCase();
  })();
  
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
      <div className={`w-0.5 h-full ${isWin ? 'bg-success/50' : 'bg-destructive/50'} opacity-70`} />
      
      {/* Entry price indicator */}
      <div
        className="absolute transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold bg-secondary/80 text-secondary-foreground"
        style={{ top: `${yPosition}px` }}
      >
        {formatPrice(trade.price)}
      </div>
      
      {/* Trade result indicator */}
      <div 
        className={`absolute transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold ${
          isWin ? 'bg-success/70 text-success-foreground' : 'bg-destructive/70 text-destructive-foreground'
        } animate-scale-in flex items-center`}
        style={{ 
          top: `${yPosition - 30}px`, 
          minWidth: '80px',
          textAlign: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-0.5">
            {isWin ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            <span className="font-mono">{tradeTypeDisplay}</span>
          </div>
          <div className="font-mono">{resultText}</div>
        </div>
      </div>
      
      {/* Close price indicator (if available) */}
      {trade.close_price && (
        <div
          className={`absolute transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold ${
            isWin ? 'bg-success/80' : 'bg-destructive/80'
          } text-white`}
          style={{ 
            top: chartHeight - ((trade.close_price - minPrice) / (maxPrice - minPrice)) * chartHeight,
            right: '-40px' 
          }}
        >
          {formatPrice(trade.close_price)}
        </div>
      )}
    </div>
  );
};

export default TradeMarker;
