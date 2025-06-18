// src/components/Fight.js
import { getCryptoImpact } from '../utils/marketIntegration';

// Add to fight initialization
async function initFight() {
  const marketData = await getCryptoImpact();
  
  // Market impact on fighters
  const playerBoost = 1 + (marketData.btcChange / 100);
  const opponentBoost = 1 + (marketData.ethChange / 100);
  
  setFighters({
    player: { ...player, damage: player.damage * playerBoost },
    opponent: { ...opponent, damage: opponent.damage * opponentBoost }
  });

  // Wyoming Protocol 7 indicator
  if (Math.abs(marketData.btcChange) > 5) {
    activateQuantumMode();
  }
}

function activateQuantumMode() {
  // Add quantum visual effects
  document.body.classList.add('quantum-mode');
  setTimeout(() => {
    document.querySelector('.ring').style.boxShadow = '0 0 25px #FFD700';
  }, 500);
}
