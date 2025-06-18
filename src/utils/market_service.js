// src/utils/marketService.js
import ccxt from 'ccxt';

const binance = new ccxt.binance();

export async function getMarketData() {
  try {
    const btc = await binance.fetchTicker('BTC/USDT');
    const eth = await binance.fetchTicker('ETH/USDT');
    const sol = await binance.fetchTicker('SOL/USDT');
    
    return {
      btc: (btc.last - btc.open) / btc.open * 100,
      eth: (eth.last - eth.open) / eth.open * 100,
      sol: (sol.last - sol.open) / sol.open * 100
    };
  } catch (error) {
    console.error("Market data error, using fallback", error);
    // Fallback data for demo
    return { btc: 1.2, eth: -0.8, sol: 3.1 };
  }
}
