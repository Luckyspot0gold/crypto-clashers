jsx
// Top of file
import CryptoClashersBridge from "./CryptoClashersBridge"

// In component return:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Existing chart */}
  </div>
  <div className="lg:col-span-1">
    <CryptoClashersBridge />
    <BarKeepBillCommentary />
  </div>
</div>
```

2. **Create BarKeepBillCommentary.tsx**:
```jsx
// components/BarKeepBillCommentary.tsx
import { VeniceAI } from "venice-sdk"

export default function BarKeepBillCommentary() {
  const [commentary, setCommentary] = useState("")
  const venice = new VeniceAI(process.env.VENICE_API_KEY, {
    personality: "wild_west_bartender"
  })

  useEffect(() => {
    const generateCommentary = async () => {
      const marketSnapshot = await getMarketSnapshot()
      const response = await venice.generateDialogue(
        `Market update: AVAX $${marketSnapshot.AVAX}, ` + 
        `WYO $${marketSnapshot.WYO}. Create colorful commentary.`
      )
      setCommentary(response)
    }
    
    generateCommentary()
    const interval = setInterval(generateCommentary, 300000) // 5 mins
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div className="ml-4">
          <h4 className="font-bold">Bar Keep Bill says:</h4>
          <p className="italic mt-2">"{commentary || 'Howdy partner! Markets lookin mighty jumpy today...'}"</p>
        </div>
      </div>
    </div>
  )
}
```
