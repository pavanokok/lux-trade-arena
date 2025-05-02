
import { AssetType } from "@/utils/marketData";

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  type: 'buy' | 'sell' | 'short' | 'cover';
  order_type: 'market' | 'limit';
  created_at: string;
  position_type?: 'long' | 'short'; // For displaying position type
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
}
