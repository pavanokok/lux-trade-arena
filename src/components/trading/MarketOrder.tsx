
import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/marketData';

interface MarketOrderProps {
  symbol: string;
  currentPrice: number;
  onPlaceOrder?: (order: OrderDetails) => void;
}

export interface OrderDetails {
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

const MarketOrder = ({ symbol, currentPrice, onPlaceOrder }: MarketOrderProps) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString());
  const [orderMethod, setOrderMethod] = useState<'market' | 'limit'>('market');
  
  // Calculate order total
  const orderPrice = orderMethod === 'market' ? currentPrice : Number(limitPrice);
  const orderTotal = Number(quantity) * orderPrice;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (orderMethod === 'limit' && (!limitPrice || Number(limitPrice) <= 0)) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      });
      return;
    }

    const order: OrderDetails = {
      type: orderType,
      orderType: orderMethod,
      symbol,
      quantity: Number(quantity),
      price: orderPrice,
      total: orderTotal,
      timestamp: new Date(),
    };

    if (onPlaceOrder) {
      onPlaceOrder(order);
    }

    // Show toast notification
    toast({
      title: `${orderType === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `${orderType === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol} at ${formatPrice(orderPrice)}`,
      variant: "default",
    });

    // Reset form
    setQuantity('');
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
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  className="mt-1" 
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

              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Current Price</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Order Total</span>
                  <span>{formatPrice(orderTotal || 0)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
              >
                Buy {symbol}
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
                <Label htmlFor="quantity-sell">Quantity</Label>
                <Input 
                  id="quantity-sell" 
                  placeholder="0.00" 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  className="mt-1" 
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

              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Current Price</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Order Total</span>
                  <span>{formatPrice(orderTotal || 0)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Sell {symbol}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketOrder;
