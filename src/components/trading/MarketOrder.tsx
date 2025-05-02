
import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/marketData';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Trade } from '@/types/trade';

interface MarketOrderProps {
  symbol: string;
  currentPrice: number;
  userBalance?: number;
  userPositions?: any[];
  onPlaceOrder?: (order: Trade) => void;
}

const MarketOrder = ({ 
  symbol, 
  currentPrice, 
  userBalance = 0, 
  userPositions = [], 
  onPlaceOrder 
}: MarketOrderProps) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString());
  const [orderMethod, setOrderMethod] = useState<'market' | 'limit'>('market');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const orderPrice = orderMethod === 'market' ? currentPrice : Number(limitPrice);
  const orderTotal = Number(quantity) * orderPrice;

  // Find relevant position to check if user can sell/cover
  const relevantPosition = userPositions.find(p => 
    p.symbol === symbol && 
    ((orderType === 'sell' && p.type === 'long') || 
     (orderType === 'buy' && positionType === 'short' && p.type === 'short'))
  );
  
  // Calculate max quantity user can buy with available balance
  const maxBuyQuantity = userBalance > 0 ? userBalance / orderPrice : 0;
  
  // Calculate max quantity user can sell from their holdings
  const maxSellQuantity = relevantPosition ? Math.abs(relevantPosition.quantity) : 0;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) || value === '') {
      setQuantity(value);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) || value === '') {
      setLimitPrice(value);
    }
  };
  
  const handleSetMaxQuantity = () => {
    if (orderType === 'buy' && positionType === 'long') {
      setQuantity(maxBuyQuantity.toFixed(4));
    } else if (orderType === 'sell' || (orderType === 'buy' && positionType === 'short')) {
      setQuantity(maxSellQuantity.toFixed(4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Please log in to place orders");
      navigate("/login");
      return;
    }
    
    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (orderMethod === 'limit' && (!limitPrice || Number(limitPrice) <= 0)) {
      toast.error("Please enter a valid limit price");
      return;
    }
    
    // Check if user has enough balance for buy orders
    if ((orderType === 'buy' && positionType === 'long') && orderTotal > userBalance) {
      toast.error(`Insufficient funds. You need $${orderTotal.toFixed(2)} but have $${userBalance.toFixed(2)}`);
      return;
    }
    
    // Check if user has enough of the asset for sell orders
    if (orderType === 'sell' && (!relevantPosition || Number(quantity) > maxSellQuantity)) {
      toast.error(`You don't have enough ${symbol} to sell`);
      return;
    }
    
    // For covering short positions
    if (orderType === 'buy' && positionType === 'short') {
      if (!relevantPosition || Number(quantity) > maxSellQuantity) {
        toast.error(`You don't have a short position of that size to cover`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Map the UI actions to the actual trade types
      const tradeType = 
        orderType === 'buy' && positionType === 'long' ? 'buy' :
        orderType === 'sell' && positionType === 'long' ? 'sell' :
        orderType === 'sell' && positionType === 'short' ? 'short' :
        'cover'; // orderType === 'buy' && positionType === 'short'
      
      const { data: trade, error } = await supabase
        .from('trades')
        .insert([{
          user_id: sessionData.session.user.id,
          symbol,
          quantity: Number(quantity),
          price: orderPrice,
          total: orderTotal,
          type: tradeType,
          order_type: orderMethod,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (onPlaceOrder && trade) {
        onPlaceOrder(trade as Trade);
      }

      toast.success(
        `${
          tradeType === 'buy' ? 'Bought' : 
          tradeType === 'sell' ? 'Sold' : 
          tradeType === 'short' ? 'Shorted' : 'Covered'
        } ${quantity} ${symbol}`,
        {
          description: `${formatPrice(orderPrice)} per unit · Total: ${formatPrice(orderTotal)}`
        }
      );

      setQuantity('');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/40 bg-secondary/10 p-6">
      <h3 className="text-lg font-medium mb-4">Place Order</h3>
      
      <Tabs defaultValue="buy" onValueChange={(value) => setOrderType(value as 'buy' | 'sell')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="buy" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">
            <ArrowDown className="mr-2 h-4 w-4" /> Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            <ArrowUp className="mr-2 h-4 w-4" /> Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <RadioGroup defaultValue="market" onValueChange={(value) => setOrderMethod(value as 'market' | 'limit')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="market" id="market" />
                    <Label htmlFor="market">Market Order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limit" id="limit" />
                    <Label htmlFor="limit">Limit Order</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <RadioGroup defaultValue="long" onValueChange={(value) => setPositionType(value as 'long' | 'short')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="long" />
                    <Label htmlFor="long">Long Position</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="short" />
                    <Label htmlFor="short">Cover Short</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSetMaxQuantity}>
                    Max
                  </Button>
                </div>
                <Input 
                  id="quantity" 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                />
              </div>

              {orderMethod === 'limit' && (
                <div>
                  <Label htmlFor="price">Limit Price</Label>
                  <Input 
                    id="price" 
                    placeholder={currentPrice.toString()} 
                    value={limitPrice} 
                    onChange={handleLimitPriceChange} 
                    className="mt-1" 
                  />
                </div>
              )}

              <div className="rounded border border-border/40 p-3 bg-secondary/5">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Current Price</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>{positionType === 'long' ? 'Available Balance' : 'Short Position'}</span>
                  <span>{positionType === 'long' ? formatPrice(userBalance) : maxSellQuantity.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Order Total</span>
                  <span>{formatPrice(orderTotal || 0)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full ${
                  positionType === 'long'
                  ? 'bg-success hover:bg-success/90 text-success-foreground'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={
                  isSubmitting || 
                  !quantity || 
                  (positionType === 'long' && orderTotal > userBalance) || 
                  (positionType === 'short' && Number(quantity) > maxSellQuantity)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${positionType === 'long' ? 'Buy' : 'Cover'} ${symbol}`
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="sell" className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <RadioGroup defaultValue="market" onValueChange={(value) => setOrderMethod(value as 'market' | 'limit')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="market" id="market-sell" />
                    <Label htmlFor="market-sell">Market Order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limit" id="limit-sell" />
                    <Label htmlFor="limit-sell">Limit Order</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <RadioGroup defaultValue="long" onValueChange={(value) => setPositionType(value as 'long' | 'short')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="sell-long" />
                    <Label htmlFor="sell-long">Sell Position</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="sell-short" />
                    <Label htmlFor="sell-short">Short Sell</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="quantity-sell">Quantity</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSetMaxQuantity}>
                    Max
                  </Button>
                </div>
                <Input 
                  id="quantity-sell" 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                />
              </div>

              {orderMethod === 'limit' && (
                <div>
                  <Label htmlFor="price-sell">Limit Price</Label>
                  <Input 
                    id="price-sell" 
                    placeholder={currentPrice.toString()} 
                    value={limitPrice} 
                    onChange={handleLimitPriceChange} 
                    className="mt-1" 
                  />
                </div>
              )}

              <div className="rounded border border-border/40 p-3 bg-secondary/5">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Current Price</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>{positionType === 'long' ? 'Available Holdings' : 'Available Balance'}</span>
                  <span>{positionType === 'long' ? `${maxSellQuantity.toFixed(4)} ${symbol}` : formatPrice(userBalance)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Order Total</span>
                  <span>{formatPrice(orderTotal || 0)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full ${
                  positionType === 'long'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
                disabled={
                  isSubmitting || 
                  !quantity || 
                  (positionType === 'long' && Number(quantity) > maxSellQuantity)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${positionType === 'long' ? 'Sell' : 'Short'} ${symbol}`
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketOrder;
