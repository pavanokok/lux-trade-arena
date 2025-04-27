
export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  type: 'buy' | 'sell';
  order_type: 'market' | 'limit';
  created_at: string;
}
