
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Position } from '@/types/trade';
import { formatPrice } from '@/utils/marketData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PositionCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  currentPrice: number;
  onPositionClosed: () => void;
}

const PositionCloseModal = ({
  isOpen,
  onClose,
  position,
  currentPrice,
  onPositionClosed
}: PositionCloseModalProps) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!position) return null;

  const handleClosePosition = async () => {
    if (!position || !position.tradeIds) {
      toast.error("Position details not available");
      return;
    }

    setIsClosing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please log in to close positions");
        return;
      }

      // Calculate PnL
      let realizedPnl = 0;
      if (position.type === 'long') {
        realizedPnl = (currentPrice - position.avgBuyPrice) * position.quantity;
      } else {
        realizedPnl = (position.avgBuyPrice - currentPrice) * Math.abs(position.quantity);
      }

      // Update all trades associated with this position
      for (const tradeId of position.tradeIds) {
        const { error: closeError } = await supabase
          .from('trades')
          .update({
            is_closed: true,
            close_price: currentPrice,
            close_timestamp: new Date().toISOString(),
            realized_pnl: realizedPnl,
            close_type: 'manual'
          })
          .eq('id', tradeId);
          
        if (closeError) {
          console.error('Error closing trade:', closeError);
          throw closeError;
        }
      }

      // Get current user balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('virtual_balance')
        .eq('id', sessionData.session.user.id)
        .single();
        
      if (userError) throw userError;

      // Update user balance
      const totalPositionValue = Math.abs(position.quantity) * currentPrice;
      const updatedBalance = position.type === 'long' 
        ? userData.virtual_balance + totalPositionValue
        : userData.virtual_balance + totalPositionValue + realizedPnl;
        
      const { error: updateBalanceError } = await supabase
        .from('users')
        .update({ virtual_balance: updatedBalance })
        .eq('id', sessionData.session.user.id);
        
      if (updateBalanceError) throw updateBalanceError;
      
      // Notify user
      toast.success(`Closed ${position.symbol} position`, {
        description: `${formatPrice(realizedPnl)} profit/loss`
      });
      
      onPositionClosed();
      onClose();
    } catch (error: any) {
      console.error('Error closing position:', error);
      toast.error(`Failed to close position: ${error.message}`);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close {position.symbol} Position</DialogTitle>
          <DialogDescription>
            Are you sure you want to close this position?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Position Type</div>
            <div className={position.type === 'long' ? 'text-success' : 'text-destructive'}>
              {position.type === 'long' ? 'Long' : 'Short'}
            </div>

            <div className="text-sm text-muted-foreground">Size</div>
            <div>{Math.abs(position.quantity).toFixed(4)} {position.symbol}</div>

            <div className="text-sm text-muted-foreground">Entry Price</div>
            <div>{formatPrice(position.avgBuyPrice)}</div>

            <div className="text-sm text-muted-foreground">Current Price</div>
            <div>{formatPrice(currentPrice)}</div>

            <div className="text-sm text-muted-foreground">Estimated P&L</div>
            <div className={position.pnl >= 0 ? 'text-success' : 'text-destructive'}>
              {formatPrice(position.pnl)} ({position.pnlPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isClosing}>
            Cancel
          </Button>
          <Button 
            onClick={handleClosePosition} 
            variant={position.pnl >= 0 ? 'default' : 'destructive'} 
            disabled={isClosing}
          >
            {isClosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Close Position'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionCloseModal;
