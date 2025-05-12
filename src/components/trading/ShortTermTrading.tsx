
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Timer, AlertCircle } from "lucide-react";
import { CandleData } from "@/utils/marketData";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ShortTermTradingProps {
  symbol: string;
  currentPrice: number;
  chartData: CandleData[];
  userBalance: number;
  onTradeComplete: (trade: Trade) => void;
  onBalanceUpdate: (newBalance: number) => void;
  onTradeActivation: (trade: Trade | null) => void;
}

const DURATIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
];

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 1000;
const PAYOUT_PERCENTAGE = 80; // 80% payout for winning trades

const ShortTermTrading = ({ 
  symbol, 
  currentPrice, 
  chartData, 
  userBalance,
  onTradeComplete,
  onBalanceUpdate,
  onTradeActivation
}: ShortTermTradingProps) => {
  // State for trading parameters
  const [amount, setAmount] = useState<number>(10);
  const [duration, setDuration] = useState<number>(60);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(currentPrice);
  const [livePnL, setLivePnL] = useState<number>(0);
  const [livePnLPercent, setLivePnLPercent] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Update current market price when currentPrice prop changes
  useEffect(() => {
    setCurrentMarketPrice(currentPrice);
    
    // Calculate live P&L if there's an active trade
    if (activeTrade && entryPrice) {
      calculateLivePnL(currentPrice);
    }
  }, [currentPrice]);
  
  // Calculate live P&L for active trades - ACCURATE TRADING LOGIC
  const calculateLivePnL = useCallback((price: number) => {
    if (!activeTrade || !entryPrice) return;
    
    // Calculate P&L based on direction and fixed payout percentage
    const isUp = activeTrade.type === "short_term_up";
    const priceDiff = price - entryPrice;
    
    // For UP trades: profit when price increases
    // For DOWN trades: profit when price decreases
    const isWinning = (isUp && priceDiff > 0) || (!isUp && priceDiff < 0);
    
    // If winning, profit is fixed percentage of amount (e.g., 80%)
    // If losing, loss is full amount
    const pnl = isWinning ? (activeTrade.total * PAYOUT_PERCENTAGE / 100) : -activeTrade.total;
    
    // Calculate P&L percentage relative to the initial investment
    const pnlPercent = (pnl / activeTrade.total) * 100;
    
    setLivePnL(pnl);
    setLivePnLPercent(pnlPercent);
  }, [activeTrade, entryPrice]);

  // Handle trade initiation
  const initiateShortTermTrade = async (direction: "up" | "down") => {
    if (isProcessing) {
      return; // Prevent multiple clicks
    }
    
    if (userBalance < amount) {
      toast.error("Insufficient balance");
      return;
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      toast.error(`Trade amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Store the exact current price at the moment of trade creation
      const exactPrice = currentPrice;
      
      // Calculate how many units/lots this amount buys
      const lotSize = amount / exactPrice;
  
      // Create new trade with the exact price
      const trade: Trade = {
        id: uuidv4(),
        user_id: "", // Will be filled by supabase
        symbol: symbol,
        quantity: lotSize, // Store actual lot size
        price: exactPrice, // Save the exact entry price
        total: amount,
        type: direction === "up" ? "short_term_up" : "short_term_down", // Store the exact direction
        order_type: "short_term",
        created_at: new Date().toISOString(),
        entry_timestamp: new Date().toISOString(),
        is_closed: false,
        duration_seconds: duration,
        result: "pending"
      };
  
      // Start the countdown
      setCountdown(duration);
      setEntryPrice(exactPrice);
      setActiveTrade(trade);
      
      // Notify parent component about active trade for chart visualization
      onTradeActivation(trade);
      
      // Deduct the stake amount from user balance
      const newBalance = userBalance - amount;
      onBalanceUpdate(newBalance);
      
      // Show success toast
      toast.success(`${direction.toUpperCase()} trade placed for $${amount}`, {
        description: `Entry price: $${exactPrice.toFixed(2)}, Duration: ${duration} seconds`
      });
      
      // Calculate initial P&L (should be close to zero at entry)
      calculateLivePnL(exactPrice);
      
      // Insert the trade into the database if user is logged in
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const userId = session.session.user.id;
        
        trade.user_id = userId;
        
        const { error } = await supabase
          .from('trades')
          .insert([trade]);
          
        if (error) {
          console.error("Error creating trade:", error);
          toast.error("Error creating trade");
        }
      }
    } catch (error) {
      console.error("Error initiating trade:", error);
      toast.error("Error initiating trade");
    } finally {
      setIsProcessing(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (countdown > 0 && activeTrade) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, activeTrade]);

  // Complete the trade when countdown reaches 0
  useEffect(() => {
    const completeTrade = async () => {
      if (!activeTrade || !entryPrice || countdown > 0) return;

      try {
        // Use the current price from props to ensure consistency with the chart
        const closePrice = currentPrice;
        
        // Determine if the trade was a win or loss based on the direction and price movement
        const isUp = activeTrade.type === "short_term_up";
        const priceDiff = closePrice - entryPrice;
        
        // For UP trades: profit when price increases
        // For DOWN trades: profit when price decreases
        const isWin = (isUp && priceDiff > 0) || (!isUp && priceDiff < 0);
        
        // Calculate profit based on the fixed payout percentage (e.g., 80%)
        // Full loss if not winning
        const profit = isWin ? (activeTrade.total * PAYOUT_PERCENTAGE / 100) : -activeTrade.total;
        
        // Calculate new balance: original balance + profit (if win)
        // If loss, profit is negative so this is correct
        const newBalance = userBalance + (isWin ? activeTrade.total + profit : 0);
  
        // Update the trade
        const completedTrade: Trade = {
          ...activeTrade,
          is_closed: true,
          close_timestamp: new Date().toISOString(),
          close_price: closePrice,
          realized_pnl: profit,
          close_type: "auto",
          result: isWin ? "win" : "loss"
        };
  
        // Update balance in database
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session?.user) {
          const userId = session.session.user.id;
          
          // Update the trade
          const { error: tradeError } = await supabase
            .from('trades')
            .update(completedTrade)
            .eq('id', completedTrade.id);
            
          if (tradeError) {
            console.error("Error updating trade:", tradeError);
            toast.error("Error updating trade");
          }
          
          // Update user balance
          const { error: balanceError } = await supabase
            .from('users')
            .update({ virtual_balance: newBalance })
            .eq('id', userId);
            
          if (balanceError) {
            console.error("Error updating balance:", balanceError);
            toast.error("Error updating balance");
          }
        }
        
        // Show result animation
        setResult(isWin ? "win" : "loss");
        setShowResult(true);
        
        // Show result toast
        if (isWin) {
          toast.success(`Trade profit: $${profit.toFixed(2)}`, {
            description: `${isUp ? 'UP' : 'DOWN'} trade closed at $${closePrice.toFixed(2)}`
          });
        } else {
          toast.error(`Trade loss: $${Math.abs(profit).toFixed(2)}`, {
            description: `${isUp ? 'UP' : 'DOWN'} trade closed at $${closePrice.toFixed(2)}`
          });
        }
        
        // Notify parent component about the completed trade
        onTradeComplete(completedTrade);
        onBalanceUpdate(newBalance);
        
        // Clear the active trade in parent component for chart visualization
        onTradeActivation(null);
        
        // Hide result after a delay
        setTimeout(() => {
          setShowResult(false);
          setActiveTrade(null);
          setEntryPrice(null);
          setLivePnL(0);
          setLivePnLPercent(0);
        }, 3000);
      } catch (error) {
        console.error("Error completing trade:", error);
        toast.error("Error completing trade");
        
        // Clean up the UI state even in case of error
        setActiveTrade(null);
        setEntryPrice(null);
        onTradeActivation(null);
      }
    };

    if (countdown === 0 && activeTrade) {
      completeTrade();
    }
  }, [countdown, activeTrade, currentPrice, entryPrice, userBalance, onTradeComplete, onBalanceUpdate, onTradeActivation]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Format percentage with sign
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return value === 0 ? '$0.00' : `${sign}$${Math.abs(value).toFixed(2)}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any active trades when component unmounts
      onTradeActivation(null);
    };
  }, [onTradeActivation]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Short-Term Trading</h3>
        {activeTrade && (
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono font-medium text-sm">
              {formatTime(countdown)}
            </span>
          </div>
        )}
      </div>

      {/* Trading form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Trade Amount ($)</label>
          <Input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={MIN_AMOUNT}
            max={Math.min(MAX_AMOUNT, userBalance)}
            disabled={!!activeTrade || isProcessing}
            className="font-mono"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Min: ${MIN_AMOUNT}</span>
            <span>Max: ${Math.min(MAX_AMOUNT, userBalance)}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Duration</label>
          <Select 
            value={String(duration)} 
            onValueChange={(value) => setDuration(Number(value))}
            disabled={!!activeTrade || isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trading buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={() => initiateShortTermTrade("up")}
            disabled={!!activeTrade || userBalance < amount || isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            <ArrowUp className="mr-2 h-5 w-5" />
            UP
          </Button>
          <Button 
            onClick={() => initiateShortTermTrade("down")}
            disabled={!!activeTrade || userBalance < amount || isProcessing}
            className="bg-destructive hover:bg-destructive/90 text-white"
            size="lg"
          >
            <ArrowDown className="mr-2 h-5 w-5" />
            DOWN
          </Button>
        </div>
      </div>

      {/* Active trade info */}
      {activeTrade && (
        <div className="rounded-md bg-muted/50 p-3 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry Price:</span>
            <span className="font-mono font-medium">${entryPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Price:</span>
            <span className="font-mono font-medium">${currentMarketPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Direction:</span>
            <span className={`font-medium ${activeTrade.type === "short_term_up" ? "text-green-500" : "text-destructive"}`}>
              {activeTrade.type === "short_term_up" ? "UP" : "DOWN"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-mono font-medium">${activeTrade.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lot Size:</span>
            <span className="font-mono font-medium">{activeTrade.quantity.toFixed(8)} {symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current P&L:</span>
            <span className={`font-mono font-medium ${livePnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(livePnL)} ({formatPercent(livePnLPercent)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Potential Payout:</span>
            <span className="font-mono font-medium text-success">
              Win: ${(activeTrade.total * PAYOUT_PERCENTAGE / 100).toFixed(2)} ({PAYOUT_PERCENTAGE}%)
            </span>
          </div>
        </div>
      )}

      {/* Result animation */}
      {showResult && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in`}
          onClick={() => setShowResult(false)}
        >
          <div 
            className={`p-8 rounded-lg ${
              result === "win" ? "bg-green-500" : "bg-destructive"
            } text-white text-center animate-scale-in`}
          >
            <h3 className="text-3xl font-bold mb-2">
              {result === "win" ? "TRADE PROFIT" : "TRADE LOSS"}
            </h3>
            <p className="text-xl font-mono">
              {formatCurrency(livePnL)}
            </p>
            <p className="text-lg font-mono mt-1">
              {formatPercent(livePnLPercent)}
            </p>
          </div>
        </div>
      )}

      {/* Info about the feature */}
      <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/40">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Predict if the price will go up or down within the selected time period.
          Win {PAYOUT_PERCENTAGE}% profit if your prediction is correct, lose your stake if incorrect.
          Trades execute at the current market price when placed.
        </p>
      </div>
    </Card>
  );
};

export default ShortTermTrading;
