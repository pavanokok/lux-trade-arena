
import { useState, useEffect } from 'react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
  basePrice: number;
}

const OrderBook = ({ symbol, basePrice }: OrderBookProps) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  
  // Generate mock order book data based on current price
  useEffect(() => {
    if (!basePrice) return;
    
    const mockAsks: OrderBookEntry[] = [];
    const mockBids: OrderBookEntry[] = [];
    
    // Generate 10 asks (sell orders) above current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 + (i + 1) * 0.0005);
      const quantity = Math.random() * 5 + 0.1;
      mockAsks.push({
        price,
        quantity,
        total: price * quantity
      });
    }
    
    // Generate 10 bids (buy orders) below current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 - (i + 1) * 0.0005);
      const quantity = Math.random() * 5 + 0.1;
      mockBids.push({
        price,
        quantity,
        total: price * quantity
      });
    }
    
    // Sort asks ascending (lowest first)
    mockAsks.sort((a, b) => a.price - b.price);
    
    // Sort bids descending (highest first)
    mockBids.sort((a, b) => b.price - a.price);
    
    setAsks(mockAsks);
    setBids(mockBids);
  }, [basePrice]);

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toFixed(price < 10 ? 4 : 2);
  };

  // Format quantity for display
  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4);
  };

  // Calculate total volume
  const totalAskVolume = asks.reduce((sum, order) => sum + order.quantity, 0);
  const totalBidVolume = bids.reduce((sum, order) => sum + order.quantity, 0);
  const maxVolume = Math.max(totalAskVolume, totalBidVolume);

  return (
    <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
      <h3 className="text-lg font-medium mb-4">Order Book</h3>
      
      <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
        <div>Price (USD)</div>
        <div className="text-right">Amount ({symbol})</div>
        <div className="text-right">Total (USD)</div>
      </div>
      
      {/* Asks (sell orders) */}
      <div className="space-y-1 mb-4">
        {asks.map((ask, index) => (
          <div key={`ask-${index}`} className="grid grid-cols-3 text-xs relative">
            <div className="text-destructive">{formatPrice(ask.price)}</div>
            <div className="text-right">{formatQuantity(ask.quantity)}</div>
            <div className="text-right">{ask.total.toFixed(2)}</div>
            <div 
              className="absolute right-0 bg-destructive/10 h-full z-0" 
              style={{ 
                width: `${(ask.quantity / maxVolume) * 100}%`,
              }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Spread indicator */}
      <div className="grid grid-cols-3 text-xs py-1 border-y border-border/20 my-2">
        <div className="font-medium">Spread</div>
        <div className="text-right">
          {bids[0] && asks[0] && (asks[0].price - bids[0].price).toFixed(4)}
        </div>
        <div className="text-right">
          {bids[0] && asks[0] && ((asks[0].price / bids[0].price - 1) * 100).toFixed(2)}%
        </div>
      </div>
      
      {/* Bids (buy orders) */}
      <div className="space-y-1 mt-4">
        {bids.map((bid, index) => (
          <div key={`bid-${index}`} className="grid grid-cols-3 text-xs relative">
            <div className="text-success">{formatPrice(bid.price)}</div>
            <div className="text-right">{formatQuantity(bid.quantity)}</div>
            <div className="text-right">{bid.total.toFixed(2)}</div>
            <div 
              className="absolute right-0 bg-success/10 h-full z-0" 
              style={{ 
                width: `${(bid.quantity / maxVolume) * 100}%`,
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
