. **Coinbase API Integration Code**  
**File: `bill_coinbase_integration.js`**  
```javascript
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { BigQuery } from '@google-cloud/bigquery'

// Initialize Coinbase connection
const coinbase = new CoinbaseWallet({
  appName: 'Bar Keep Bill',
  appLogoUrl: 'https://cryptoclashers.games/bill-logo.png',
  jsonRpcUrl: `https://mainnet.base.org`
})

// Connect to Google BigQuery
const bq = new BigQuery({ projectId: 'wyoverse-saloon' })

// Main integration function
export async function getBillInsights(userId) {
  try {
    // 1. Fetch Coinbase portfolio
    const portfolio = await coinbase.fetchBalance(userId)
    
    // 2. Get market context
    const marketContext = await bq.query(`
      SELECT * 
      FROM \`market_data.crypto_context\`
      WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      ORDER BY timestamp DESC
      LIMIT 1
    `)
    
    // 3. Generate Bill-style advice
    return {
      portfolioSnapshot: portfolio,
      billAdvice: generateSaloonAdvice(portfolio, marketContext[0]),
      riskScore: calculateRiskScore(portfolio),
      topOpportunities: findMarketOpportunities(marketContext[0])
    }
  } catch (error) {
    console.error("Yeehaw! We got a problem:", error)
    return { error: "Bill's still soberin' up... try again later!" }
  }
}

// Bill's signature advice generator
function generateSaloonAdvice(portfolio, market) {
  const whiskeyWisdom = [
    "That portfolio's tighter than a drum!",
    "I've seen tumbleweeds with more movement than this!",
    "You're sittin' prettier than a two-dollar pistol!",
    "Diversify or die, partner!"
  ]
  
  const randomWisdom = whiskeyWisdom[Math.floor(Math.random() * whiskeyWisdom.length)]
  const topAsset = portfolio.assets.sort((a,b) => b.value - a.value)[0]
  
  return `Well howdy partner! ${randomWisdom} Your ${topAsset.name} holdings are lookin' 
          stronger than moonshine. With ${market.sentiment} sentiment in the saloon, 
          I'd reckon ${topAsset.change_24h > 0 ? 'keep ridin\' high' : 'buckle up for turbulence'}.`
}
```
