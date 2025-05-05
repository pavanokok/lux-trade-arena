
import { AssetType } from "@/utils/marketData";

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  type: 'buy' | 'sell' | 'short' | 'cover' | 'short_term_up' | 'short_term_down';
  order_type: 'market' | 'limit' | 'short_term';
  created_at: string;
  position_type?: 'long' | 'short'; // For displaying position type
  entry_timestamp?: string;
  close_timestamp?: string;
  close_price?: number;
  realized_pnl?: number;
  is_closed?: boolean;
  close_type?: 'manual' | 'auto';
  trade_duration?: number; // Duration in seconds
  duration_seconds?: number; // For short-term trades specifically
  result?: 'win' | 'loss' | 'pending'; // For short-term trades outcome
}

// Interface for portfolio positions
export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number | null;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  type: 'long' | 'short';
  assetType: AssetType; // Crypto or Stock
  entryTimestamp?: string;
  tradeIds?: string[]; // IDs of trades that make up this position
}
