// src/components/Fight.js
import { getMarketData } from '../utils/marketService';

// Inside your fight component
useEffect(() => {
  const loadMarketData = async () => {
    const marketData = await getMarketData();
    // Adjust player and opponent based on market
    // Example: BTC change affects player, ETH affects opponent
    setPlayer(prev => ({
      ...prev,
      damage: prev.damage * (1 + marketData.btc / 100),
      health: prev.health * (1 + Math.abs(marketData.btc) / 100)
    }));
    setOpponent(prev => ({
      ...prev,
      damage: prev.damage * (1 + marketData.eth / 100),
      health: prev.health * (1 + Math.abs(marketData.eth) / 100)
    }));
  };
  loadMarketData();
}, []);
