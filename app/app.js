// In your App.js or main component
<footer style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', color: '#FFD700' }}>
  Powered by StoneVerse Protocol 7
</footer>
# emergency-fix.patch
diff --git a/src/App.js b/src/App.js
index a1b2c3d..e4f5a6b 100644
--- a/src/App.js
+++ b/src/App.js
@@ -12,6 +12,7 @@ function App() {
     if (window.location.host.includes('vercel.app')) {
       setGrantMode(true);
       preloadMarketData();
+      document.body.classList.add('grant-demo');
     }
   }, []);
// ADD TO src/App.js
useEffect(() => {
  const stoneVerseBadge = document.createElement('div');
  stoneVerseBadge.innerHTML = '⚡ STONEVERSE PROTOCOL 7';
  stoneVerseBadge.style.position = 'fixed';
  stoneVerseBadge.style.bottom = '10px';
  stoneVerseBadge.style.right = '10px';
  stoneVerseBadge.style.background = 'rgba(255, 215, 0, 0.2)';
  stoneVerseBadge.style.padding = '5px 10px';
  stoneVerseBadge.style.borderRadius = '10px';
  stoneVerseBadge.style.fontWeight = 'bold';
  document.body.appendChild(stoneVerseBadge);
}, []);
`javascript
import { startEventListeners } from '@/services/cryptoClashers'
import simulationEngine from '@/lib/simulationEngine'

if (typeof window !== 'undefined') {
  startEventListeners(simulationEngine)
}
```
