
import axios from "axios";
import { Time } from "lightweight-charts";

// Types for our market data
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
}

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Fetch crypto data from CoinGecko
export async function fetchCryptoData(coinId: string): Promise<MarketData | null> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );

    const data = response.data;
    return {
      symbol: data.symbol.toUpperCase(),
      price: data.market_data.current_price.usd,
      change: data.market_data.price_change_24h_in_currency.usd,
      changePercent: data.market_data.price_change_percentage_24h,
      high: data.market_data.high_24h.usd,
      low: data.market_data.low_24h.usd,
      volume: formatCurrency(data.market_data.total_volume.usd),
      marketCap: formatCurrency(data.market_data.market_cap.usd),
    };
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return null;
  }
}

// Fetch crypto historical data for charts
export async function fetchCryptoHistoricalData(
  coinId: string,
  days: number = 7
): Promise<CandleData[]> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );

    // CoinGecko OHLC endpoint returns data in format:
    // [timestamp, open, high, low, close]
    return response.data.map((item: number[]) => {
      const [timestamp, open, high, low, close] = item;
      return {
        time: timestamp / 1000 as Time, // Convert to seconds for lightweight-charts
        open,
        high,
        low,
        close
      };
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
}

// Format large numbers to currency format with K, M, B suffixes
export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

// Format number as currency without abbreviation
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  }).format(price);
}

// Format percentage change
export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Search for assets (both crypto and stocks)
export async function searchAssets(query: string): Promise<any[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    // Search for cryptocurrencies
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    
    return response.data.coins.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: "crypto",
      thumb: coin.thumb
    }));
  } catch (error) {
    console.error("Error searching assets:", error);
    return [];
  }
}
