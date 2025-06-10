import type { CandlestickData } from "./types"

// This function simulates fetching crypto data
// In a real app, you would connect to a real API like CoinGecko or Binance
export async function fetchCryptoData(coin: string): Promise<CandlestickData[]> {
  // For demo purposes, we'll generate some realistic-looking data
  // In a real app, replace this with actual API calls

  // Base prices for our cryptocurrencies (updated to current market values)
  const basePrices: Record<string, number> = {
    bitcoin: 86000, // Updated to 86k as requested
    ethereum: 3500,
    solana: 150,
    binancecoin: 600,
    xrp: 0.5,
    cardano: 0.45,
    dogecoin: 0.15,
    polkadot: 7.5,
    avalanche: 35,
    tron: 0.12,
    chainlink: 15,
    polygon: 0.8,
    litecoin: 80,
    shiba: 0.000025,
    uniswap: 10,
    stellar: 0.11,
    monero: 170,
    cosmos: 8.5,
    filecoin: 5.5,
    near: 6.2,
    vechain: 0.03,
    algorand: 0.18,
    tezos: 1.1,
    eos: 0.75,
    theta: 1.5,
    fantom: 0.65,
    aave: 95,
    maker: 1800,
    neo: 12,
    iota: 0.25,
  }

  const basePrice = basePrices[coin.toLowerCase()] || 100

  // Generate 24 hours of hourly candles (most recent first)
  const candles: CandlestickData[] = []
  const now = Date.now()

  // Start with a realistic price
  let lastClose = basePrice

  for (let i = 24; i >= 0; i--) {
    // Create some realistic price movement
    // Higher market cap coins have lower volatility
    const volatilityMap: Record<string, number> = {
      bitcoin: 0.01,
      ethereum: 0.015,
      solana: 0.03,
      dogecoin: 0.04,
      shiba: 0.05,
    }

    const volatilityFactor = volatilityMap[coin.toLowerCase()] || 0.025
    const randomChange = (Math.random() - 0.5) * lastClose * volatilityFactor

    // Generate a realistic candle
    const open = lastClose
    const close = open + randomChange
    const high = Math.max(open, close) + Math.random() * Math.abs(randomChange) * 0.5
    const low = Math.min(open, close) - Math.random() * Math.abs(randomChange) * 0.5

    // Generate realistic volume
    const volumeBase =
      coin.toLowerCase() === "bitcoin"
        ? 5000000
        : coin.toLowerCase() === "ethereum"
          ? 3000000
          : coin.toLowerCase() === "solana"
            ? 2000000
            : 1000000
    const volume = volumeBase + Math.random() * volumeBase

    candles.push({
      time: now - i * 60 * 60 * 1000, // hourly candles
      open,
      high,
      low,
      close,
      volume,
    })

    // Set up for next candle
    lastClose = close
  }

  // For the most recent candle, make it more dynamic to create interesting boxing actions
  const latestCandle = candles[candles.length - 1]

  // Randomly decide if we want a bullish or bearish candle for more action
  const isBullish = Math.random() > 0.5

  if (isBullish) {
    latestCandle.close = latestCandle.open * (1 + Math.random() * 0.03)
    latestCandle.high = latestCandle.close * (1 + Math.random() * 0.01)
  } else {
    latestCandle.close = latestCandle.open * (1 - Math.random() * 0.03)
    latestCandle.low = latestCandle.close * (1 - Math.random() * 0.01)
  }

  return candles
}

// Get the list of available fighters (top 30 coins)
export const availableFighters = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "🐂", color: "orange" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "🦊", color: "purple" },
  { id: "solana", name: "Solana", symbol: "SOL", icon: "🐻", color: "blue" },
  { id: "binancecoin", name: "Binance Coin", symbol: "BNB", icon: "🐯", color: "yellow" },
  { id: "xrp", name: "XRP", symbol: "XRP", icon: "🦅", color: "blue" },
  { id: "cardano", name: "Cardano", symbol: "ADA", icon: "🦋", color: "blue" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", icon: "🐕", color: "yellow" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT", icon: "⚫", color: "pink" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", icon: "❄️", color: "red" },
  { id: "tron", name: "Tron", symbol: "TRX", icon: "🔴", color: "red" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK", icon: "⛓️", color: "blue" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", icon: "⭐", color: "purple" },
  { id: "litecoin", name: "Litecoin", symbol: "LTC", icon: "🥈", color: "gray" },
  { id: "shiba", name: "Shiba Inu", symbol: "SHIB", icon: "🐕", color: "orange" },
  { id: "uniswap", name: "Uniswap", symbol: "UNI", icon: "🦄", color: "pink" },
  { id: "stellar", name: "Stellar", symbol: "XLM", icon: "🚀", color: "blue" },
  { id: "monero", name: "Monero", symbol: "XMR", icon: "🛡️", color: "orange" },
  { id: "cosmos", name: "Cosmos", symbol: "ATOM", icon: "⚛️", color: "purple" },
  { id: "filecoin", name: "Filecoin", symbol: "FIL", icon: "📁", color: "green" },
  { id: "near", name: "Near Protocol", symbol: "NEAR", icon: "🌊", color: "blue" },
  { id: "vechain", name: "VeChain", symbol: "VET", icon: "🔗", color: "blue" },
  { id: "algorand", name: "Algorand", symbol: "ALGO", icon: "🔷", color: "green" },
  { id: "tezos", name: "Tezos", symbol: "XTZ", icon: "🧩", color: "blue" },
  { id: "eos", name: "EOS", symbol: "EOS", icon: "⚪", color: "black" },
  { id: "theta", name: "Theta", symbol: "THETA", icon: "📡", color: "green" },
  { id: "fantom", name: "Fantom", symbol: "FTM", icon: "👻", color: "blue" },
  { id: "aave", name: "Aave", symbol: "AAVE", icon: "👻", color: "purple" },
  { id: "maker", name: "Maker", symbol: "MKR", icon: "🏛️", color: "green" },
  { id: "neo", name: "NEO", symbol: "NEO", icon: "🔶", color: "green" },
  { id: "iota", name: "IOTA", symbol: "MIOTA", icon: "🧠", color: "purple" },
]

