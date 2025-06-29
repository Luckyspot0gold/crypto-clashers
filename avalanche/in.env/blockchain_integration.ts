typescript
// lib/blockchain.ts
import { Avalanche, BN } from "avalanche"
import { CryptoClashersABI } from "./abis"

const avax = new Avalanche(
  process.env.AVAX_IP,
  parseInt(process.env.AVAX_PORT),
  process.env.AVAX_PROTOCOL
)

export const fetchLiveMarketData = async () => {
  const [avaxPrice, wyoPrice] = await Promise.all([
    avax.XChain().getAssetPrice("AVAX"),
    avax.CChain().contractCall(
      process.env.WYO_CONTRACT_ADDRESS,
      CryptoClashersABI,
      "currentPrice"
    )
  ])
  
  return {
    timestamp: Date.now(),
    assets: {
      AVAX: avaxPrice.toNumber(),
      WYO: new BN(wyoPrice).div(1e18).toNumber(),
      BTC: avaxPrice.toNumber() * 0.000025
    }
  }
}

export const handleGameEvent = async (event: GameEvent) => {
  const impact = event.type === "NFT_SALE" ? 
    event.value * 0.01 : 
    event.value * 0.005
  
  const tx = await avax.CChain().issueTx(
    buildMarketImpactTx(event.player, impact)
  )
  
  return {
    txHash: tx.id,
    impactValue: impact
  }
}
