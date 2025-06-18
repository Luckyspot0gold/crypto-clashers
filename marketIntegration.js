// src/utils/marketIntegration.js
import ccxt from 'ccxt';

const binance = new ccxt.binance();

export async function getCryptoImpact() {
  try {
    const btc = await binance.fetchTicker('BTC/USDT');
    const eth = await binance.fetchTicker('ETH/USDT');
    
    return {
      btcChange: (btc.last - btc.open) / btc.open * 100,
      ethChange: (eth.last - eth.open) / eth.open * 100
    };
  } catch (error) {
    console.error("Market connection failed:", error);
    return { btcChange: 1.5, ethChange: -0.8 }; // Wyoming fallback
  }
}
