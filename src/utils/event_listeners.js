javascript
import { ethers } from "ethers"
import { VeniceAI } from "venice-sdk"

// Connect to Ethereum provider (Avalanche compatible)
const provider = new ethers.providers.WebSocketProvider(
  process.env.AVAX_WSS_URL
)

// Event signatures
const EVENT_SIGNATURES = {
  MatchResult: "event MatchResult(address winner, uint256 tokenId, uint256 amount)",
  NFTSold: "event NFTSold(uint256 tokenId, uint256 price)"
}

// Initialize contract
const contract = new ethers.Contract(
  process.env.CRYPTO_CLASHERS_ADDRESS,
  CRYPTO_CLASHERS_ABI, // Your contract ABI
  provider
)

// Listen to game events
export function startEventListeners(marketSimulator) {
  // Match completion handler
  contract.on(EVENT_SIGNATURES.MatchResult, async (winner, tokenId, amount) => {
    const impact = await calculateMarketImpact(tokenId, amount)
    marketSimulator.applyGameImpact(impact)
    
    // Generate narrative with Venice AI
    const narrative = await VeniceAI.generateText(
      `CryptoClashers match #${tokenId} won by ${winner.slice(0,6)}... Impact: ${impact}%`
    )
    marketSimulator.logEvent(narrative)
  })
  
  // NFT sale handler
  contract.on(EVENT_SIGNATURES.NFTSold, (tokenId, price) => {
    marketSimulator.updateNFTLiquidity(tokenId, price)
  })
}

// Calculate market impact
async function calculateMarketImpact(tokenId, amount) {
  // Base impact + Venice AI sentiment analysis
  const baseImpact = amount / 1000
  const sentiment = await VeniceAI.analyzeSentiment(
    `Fighter #${tokenId} won ${amount} tokens`
  )
  return baseImpact * (sentiment.score > 0 ? 1.2 : 0.8)
}
```
