
import axios from "axios";
import { Time } from "lightweight-charts";
import { toast } from "sonner";

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

// Asset types enum
export enum AssetType {
  CRYPTO = "crypto",
  STOCK = "stock"
}

// Interface for asset data
export interface AssetData {
  id: string; 
  name: string; 
  symbol: string; 
  price: number; 
  change: number; 
  volume: string;
  marketCap: string;
  chart: number[];
  type?: AssetType;
}

// Default data as fallback if API fails
export const defaultCryptoAssets: AssetData[] = [
  { 
    id: "btc", 
    name: "Bitcoin", 
    symbol: "BTC", 
    price: 56842.12, 
    change: 3.42, 
    volume: "$48.2B",
    marketCap: "$1.1T",
    chart: [42, 45, 43, 44, 46, 47, 48, 45, 46, 49, 50, 51]
  },
  { 
    id: "eth", 
    name: "Ethereum", 
    symbol: "ETH", 
    price: 3245.67, 
    change: 2.18, 
    volume: "$21.3B",
    marketCap: "$389.5B",
    chart: [38, 40, 37, 39, 41, 40, 41, 43, 44, 45, 46, 44]
  },
  { 
    id: "sol", 
    name: "Solana", 
    symbol: "SOL", 
    price: 123.45, 
    change: 5.67, 
    volume: "$5.7B",
    marketCap: "$49.8B",
    chart: [30, 32, 33, 34, 36, 38, 37, 39, 40, 42, 43, 45]
  },
  { 
    id: "ada", 
    name: "Cardano", 
    symbol: "ADA", 
    price: 0.5498, 
    change: -2.34, 
    volume: "$2.1B",
    marketCap: "$19.2B",
    chart: [20, 22, 21, 19, 18, 17, 16, 18, 17, 16, 15, 14]
  },
  { 
    id: "bnb", 
    name: "Binance Coin", 
    symbol: "BNB", 
    price: 582.73, 
    change: 1.25, 
    volume: "$1.9B",
    marketCap: "$89.4B",
    chart: [50, 51, 52, 53, 51, 52, 53, 54, 55, 56, 55, 56]
  },
  { 
    id: "doge", 
    name: "Dogecoin", 
    symbol: "DOGE", 
    price: 0.1845, 
    change: 1.72, 
    volume: "$1.3B",
    marketCap: "$24.7B",
    chart: [25, 26, 27, 28, 27, 26, 27, 28, 29, 30, 31, 30]
  },
  { 
    id: "xrp", 
    name: "Ripple", 
    symbol: "XRP", 
    price: 0.5283, 
    change: 0.87, 
    volume: "$1.1B",
    marketCap: "$27.9B",
    chart: [32, 33, 32, 31, 32, 33, 34, 35, 34, 33, 34, 35]
  },
  { 
    id: "dot", 
    name: "Polkadot", 
    symbol: "DOT", 
    price: 6.94, 
    change: -1.25, 
    volume: "$540M",
    marketCap: "$8.6B",
    chart: [40, 39, 38, 37, 36, 37, 36, 35, 34, 33, 34, 33]
  },
  { 
    id: "matic", 
    name: "Polygon", 
    symbol: "MATIC", 
    price: 0.578, 
    change: 3.18, 
    volume: "$320M",
    marketCap: "$5.4B",
    chart: [22, 23, 24, 25, 26, 27, 26, 27, 28, 29, 30, 31]
  },
  { 
    id: "avax", 
    name: "Avalanche", 
    symbol: "AVAX", 
    price: 34.72, 
    change: 4.56, 
    volume: "$1.2B",
    marketCap: "$12.5B",
    chart: [35, 36, 37, 38, 39, 40, 41, 42, 43, 42, 43, 44]
  },
  { 
    id: "link", 
    name: "Chainlink", 
    symbol: "LINK", 
    price: 14.92, 
    change: 2.36, 
    volume: "$680M",
    marketCap: "$8.7B",
    chart: [28, 29, 30, 31, 30, 31, 32, 33, 34, 35, 36, 35]
  }
];

export const defaultStockAssets: AssetData[] = [
  { 
    id: "aapl", 
    name: "Apple Inc.", 
    symbol: "AAPL", 
    price: 182.89, 
    change: 1.34, 
    volume: "$8.2B",
    marketCap: "$2.9T",
    chart: [42, 43, 44, 45, 44, 45, 46, 47, 46, 45, 46, 48]
  },
  { 
    id: "msft", 
    name: "Microsoft", 
    symbol: "MSFT", 
    price: 415.56, 
    change: 0.89, 
    volume: "$5.1B",
    marketCap: "$3.1T",
    chart: [60, 61, 62, 63, 62, 63, 64, 65, 66, 67, 66, 67]
  },
  { 
    id: "googl", 
    name: "Alphabet", 
    symbol: "GOOGL", 
    price: 146.95, 
    change: -0.23, 
    volume: "$3.2B",
    marketCap: "$1.85T",
    chart: [55, 54, 55, 56, 54, 53, 54, 53, 52, 53, 52, 51]
  },
  { 
    id: "amzn", 
    name: "Amazon", 
    symbol: "AMZN", 
    price: 178.75, 
    change: 2.45, 
    volume: "$6.4B",
    marketCap: "$1.84T",
    chart: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
  },
  { 
    id: "tsla", 
    name: "Tesla", 
    symbol: "TSLA", 
    price: 176.75, 
    change: -1.98, 
    volume: "$10.2B",
    marketCap: "$560.3B",
    chart: [28, 27, 28, 26, 25, 24, 23, 22, 23, 24, 23, 22]
  }
];

// Map of all default assets for quick lookups
interface DefaultAssetMapEntry extends AssetData {
  type: AssetType;
}

// Initialize the map correctly
const defaultAssetMap = new Map<string, DefaultAssetMapEntry>();

// Add crypto assets to the map
defaultCryptoAssets.forEach(asset => {
  defaultAssetMap.set(asset.symbol.toLowerCase(), {
    ...asset,
    type: AssetType.CRYPTO
  });
});

// Add stock assets to the map
defaultStockAssets.forEach(asset => {
  defaultAssetMap.set(asset.symbol.toLowerCase(), {
    ...asset,
    type: AssetType.STOCK
  });
});

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
      volume: formatLargeNumber(data.market_data.total_volume.usd),
      marketCap: formatLargeNumber(data.market_data.market_cap.usd),
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

// Get asset info (name and id) based on symbol
export function getAssetInfo(symbol: string): { name: string; id: string; type: AssetType } | null {
  const lowerSymbol = symbol.toLowerCase();
  
  // Check default asset map first
  if (defaultAssetMap.has(lowerSymbol)) {
    const asset = defaultAssetMap.get(lowerSymbol)!;
    return {
      name: asset.name,
      id: asset.id,
      type: asset.type
    };
  }
  
  // If not found in our map, use the symbol itself as ID (for crypto)
  // and uppercase as name as fallback
  return {
    name: symbol.toUpperCase(),
    id: lowerSymbol,
    type: AssetType.CRYPTO // Default to crypto
  };
}

// Get current price for an asset
export async function getAssetCurrentPrice(symbol: string): Promise<number | null> {
  try {
    // Check local storage cache first to avoid excessive API calls
    const cacheKey = `price_${symbol.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();
    
    if (cachedData) {
      const { price, timestamp } = JSON.parse(cachedData);
      // Use cache if it's less than 2 minutes old
      if (now - timestamp < 2 * 60 * 1000) {
        return price;
      }
    }
    
    // Get asset info
    const assetInfo = getAssetInfo(symbol);
    if (!assetInfo) return null;
    
    let price: number | null = null;
    
    if (assetInfo.type === AssetType.CRYPTO) {
      // For crypto, fetch from CoinGecko
      const data = await fetchCryptoData(assetInfo.id);
      if (data) price = data.price;
    } else {
      // For stocks, use default price (would be replaced with real API in production)
      const stockAsset = defaultStockAssets.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
      if (stockAsset) price = stockAsset.price;
    }
    
    // If no price found in APIs, check default data as fallback
    if (price === null) {
      const defaultAsset = defaultAssetMap.get(symbol.toLowerCase());
      if (defaultAsset) price = defaultAsset.price;
    }
    
    // Cache the result if we have a price
    if (price !== null) {
      localStorage.setItem(cacheKey, JSON.stringify({ price, timestamp: now }));
      return price;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    
    // As final fallback, try default data
    const defaultAsset = defaultAssetMap.get(symbol.toLowerCase());
    if (defaultAsset) return defaultAsset.price;
    
    return null;
  }
}

// Format large numbers to currency format with K, M, B, T suffixes
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

// Format number as currency without abbreviation
export function formatPrice(price: number | null): string {
  if (price === null || isNaN(price)) {
    return 'Price Unavailable';
  }
  
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
    // First check our default assets for matches
    const matchingDefaultAssets = [...defaultCryptoAssets, ...defaultStockAssets]
      .filter(asset => 
        asset.symbol.toLowerCase().includes(query.toLowerCase()) || 
        asset.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5) // Take top 5 matches
      .map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: defaultAssetMap.get(asset.symbol.toLowerCase())?.type || AssetType.CRYPTO,
        thumb: null
      }));
    
    if (matchingDefaultAssets.length > 0) {
      return matchingDefaultAssets;
    }
    
    // If no matches in default assets, search via API
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
