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
//// // In the same Fight.js
useEffect(() => {
  const loadMarketData = async () => {
    const marketData = await getMarketData();
    // ... adjust fighters

    // Check for quantum mode (if any market change is above 5%)
    if (Math.abs(marketData.btc) > 5 || Math.abs(marketData.eth) > 5 || Math.abs(marketData.sol) > 5) {
      activateQuantumMode();
    }
  };
}, []);

const activateQuantumMode = () => {
  // Add a class to the body for quantum effects
  document.body.classList.add('quantum-mode');
  // Remove after 5 seconds
  setTimeout(() => {
    document.body.classList.remove('quantum-mode');
  }, 5000);
};
// Fix in: src/components/Fight.js
const startFight = async () => {
  // ADD MARKET INTEGRATION
  const marketData = await getCryptoImpact();
  
  // Apply market effects (ADD THESE LINES)
  const playerBoost = 1 + (marketData.btcChange / 100);
  const opponentBoost = 1 + (marketData.ethChange / 100);
  
  setFighters({
    player: { ...player, damage: player.damage * playerBoost },
    opponent: { ...opponent, damage: opponent.damage * opponentBoost }
  });

  // REST OF FIGHT LOGIC...
}
// ADD TO Fight.js
<div className="market-impact">
  BTC: {marketData.btcChange.toFixed(2)}% | ETH: {marketData.ethChange.toFixed(2)}%
</div>
