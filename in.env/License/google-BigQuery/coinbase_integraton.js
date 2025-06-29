``javascript
// bill_advisor.js
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'

const coinbase = new CoinbaseWallet({
  appName: 'Wyoverse Pioneer',
  appLogoUrl: 'https://cryptoclashers.games/logo.png',
  jsonRpcUrl: `https://mainnet.base.org`
})

export const getPortfolioInsights = async (user_id) => {
  const portfolio = await coinbase.fetchBalance(user_id)
  const recommendations = await generateAdvice(portfolio)
  return {
    top_assets: portfolio.slice(0, 3),
    risk_score: calculateRisk(portfolio),
    bill_advice: recommendations
  }
}
```
