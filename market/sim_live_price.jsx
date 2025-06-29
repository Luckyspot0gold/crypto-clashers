diff
+ import { getLivePrices } from '@/services/avalanche'
+ import { startEventListeners } from '@/services/cryptoClashers'

export default function MarketSimulator() {
  const [marketData, setMarketData] = useState(null)
  
  useEffect(() => {
+   // Initialize event listeners
+   startEventListeners(simulationEngine)
    
    // Refresh data every 30s
    const interval = setInterval(async () => {
+     const liveData = await getLivePrices()
-     const simulated = simulateMarket(liveData)
+     const simulated = simulateMarket(liveData, simulationEngine)
      
      setMarketData({
        ...liveData,
        predictions: simulated
      })
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Enhanced visualization
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <MarketChart 
          data={marketData} 
+         nftLiquidity={simulationEngine.nftPool}
        />
      </div>
      <div className="col-span-1">
        <EventLog />
+       <CryptoClashersEvents />
      </div>
    </div>
  )
}
