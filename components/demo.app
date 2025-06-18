// Add to App.js
const [grantMode, setGrantMode] = useState(false);

useEffect(() => {
  // Auto-activate demo mode for vercel.app domains
  if (window.location.host.includes('vercel.app')) {
    setGrantMode(true);
    preloadMarketData();
  }
}, []);

function preloadMarketData() {
  // Force interesting market scenario
  window.mockMarketData = {
    btcChange: 7.8,
    ethChange: -3.2
  };
}
