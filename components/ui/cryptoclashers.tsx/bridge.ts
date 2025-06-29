`jsx
// components/CryptoClashersBridge.tsx
import { useWallet } from "@avax/wallet-adapter-react"

export default function CryptoClashersBridge() {
  const wallet = useWallet()
  const [impactEvents, setImpactEvents] = useState<GameEvent[]>([])

  useEffect(() => {
    if (!wallet.connected) return
    
    const contract = new ethers.Contract(
      process.env.CRYPTO_CLASHERS_ADDRESS,
      CRYPTO_CLASHERS_ABI,
      wallet.signer
    )
