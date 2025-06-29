Add to MarketSimulator.tsx**:
```jsx
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
