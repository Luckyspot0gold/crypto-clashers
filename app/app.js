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
