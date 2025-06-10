"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, Star, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { availableFighters } from "@/lib/crypto-api"

interface SelectBoxingCoinProps {
  onSelectFighters: (leftFighter: any, rightFighter: any) => void
  onContinue: () => void
}

export default function SelectBoxingCoin({ onSelectFighters, onContinue }: SelectBoxingCoinProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [leftFighter, setLeftFighter] = useState(availableFighters[0]) // Bitcoin by default
  const [rightFighter, setRightFighter] = useState(availableFighters[2]) // Solana by default
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch crypto prices from API
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from a real API like:
        // const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        // For this demo, we'll use mock data

        // Mock prices for demo
        const mockPrices: Record<string, number> = {
          bitcoin: 86000,
          ethereum: 3500,
          solana: 150,
          binancecoin: 600,
          xrp: 0.5,
          cardano: 0.45,
          dogecoin: 0.15,
          polkadot: 7.5,
          avalanche: 35,
          tron: 0.12,
          chainlink: 15,
          polygon: 0.8,
          litecoin: 80,
          shiba: 0.000025,
          uniswap: 10,
          stellar: 0.11,
          monero: 170,
          cosmos: 8.5,
          filecoin: 5.5,
          near: 6.2,
        }

        // Add some random fluctuation to make it look real-time
        const fluctuatedPrices: Record<string, number> = {}
        Object.keys(mockPrices).forEach((coin) => {
          const basePrice = mockPrices[coin]
          const fluctuation = basePrice * (0.995 + Math.random() * 0.01) // ±0.5% fluctuation
          fluctuatedPrices[coin] = Number.parseFloat(fluctuation.toFixed(basePrice < 1 ? 6 : 2))
        })

        setCryptoPrices(fluctuatedPrices)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error fetching crypto prices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoPrices()

    // Refresh prices every 30 seconds
    const intervalId = setInterval(fetchCryptoPrices, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Filter fighters based on search term
  const filteredFighters = availableFighters.filter(
    (fighter) =>
      fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle fighter selection
  const handleSelectFighter = (fighter: any, position: "left" | "right") => {
    if (position === "left") {
      setLeftFighter(fighter)
      // If the same fighter is selected for both sides, switch the right fighter
      if (fighter.id === rightFighter.id) {
        const nextFighter = availableFighters.find((f) => f.id !== fighter.id) || availableFighters[1]
        setRightFighter(nextFighter)
      }
    } else {
      setRightFighter(fighter)
      // If the same fighter is selected for both sides, switch the left fighter
      if (fighter.id === leftFighter.id) {
        const nextFighter = availableFighters.find((f) => f.id !== fighter.id) || availableFighters[0]
        setLeftFighter(nextFighter)
      }
    }
  }

  // Confirm fighter selection and continue
  const handleContinue = () => {
    onSelectFighters(leftFighter, rightFighter)
    onContinue()
  }

  // Format price with appropriate decimals
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "Loading..."

    return price > 1000
      ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : price > 100
        ? price.toLocaleString(undefined, { maximumFractionDigits: 1 })
        : price > 1
          ? price.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : price.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  // Get color for fighter card
  const getColorClass = (colorName: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string }> = {
      orange: { bg: "bg-orange-500/20", border: "border-orange-500" },
      purple: { bg: "bg-purple-500/20", border: "border-purple-500" },
      blue: { bg: "bg-blue-500/20", border: "border-blue-500" },
      red: { bg: "bg-red-500/20", border: "border-red-500" },
      green: { bg: "bg-green-500/20", border: "border-green-500" },
      yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500" },
      gray: { bg: "bg-gray-500/20", border: "border-gray-500" },
      pink: { bg: "bg-pink-500/20", border: "border-pink-500" },
      black: { bg: "bg-gray-700/40", border: "border-gray-700" },
    }

    const colorClasses = colorMap[colorName] || colorMap.gray

    return isSelected
      ? `${colorClasses.bg} ${colorClasses.border} border-2`
      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 mb-4">
            Select Your Fighters
          </h1>
          <p className="text-xl text-gray-300">Choose two cryptocurrencies to battle in the boxing ring</p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-400" />
                Current Matchup
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLastUpdated(new Date())
                  // In a real app, you would refresh prices here
                }}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Prices
              </Button>
            </div>
            <CardDescription>
              {lastUpdated ? `Prices last updated: ${lastUpdated.toLocaleTimeString()}` : "Loading market data..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Fighter */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-4xl mr-3">{leftFighter.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{leftFighter.name}</h3>
                      <p className="text-gray-400">{leftFighter.symbol}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleSelectFighter(leftFighter, "left")}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-xl font-bold text-green-400">
                      ${formatPrice(cryptoPrices[leftFighter.id])}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap Rank:</span>
                    <span className="font-medium">
                      #{availableFighters.findIndex((f) => f.id === leftFighter.id) + 1}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Change:</span>
                    <span className="font-medium text-green-400">+{(Math.random() * 5).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Right Fighter */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-4xl mr-3">{rightFighter.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{rightFighter.name}</h3>
                      <p className="text-gray-400">{rightFighter.symbol}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleSelectFighter(rightFighter, "right")}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-xl font-bold text-green-400">
                      ${formatPrice(cryptoPrices[rightFighter.id])}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap Rank:</span>
                    <span className="font-medium">
                      #{availableFighters.findIndex((f) => f.id === rightFighter.id) + 1}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Change:</span>
                    <span className="font-medium text-red-400">-{(Math.random() * 3).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-4">
                These fighters will battle for 8 rounds (8 hours) with points awarded based on market performance.
              </p>
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-2"
                size="lg"
              >
                Continue to Betting
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-400" />
              Select Different Fighters
            </CardTitle>
            <CardDescription>Choose from the top cryptocurrencies to battle in the arena</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="all">All Coins</TabsTrigger>
                  <TabsTrigger value="trending">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="gainers">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    Gainers
                  </TabsTrigger>
                  <TabsTrigger value="losers">
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                    Losers
                  </TabsTrigger>
                </TabsList>

                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search coins..."
                    className="pl-8 bg-gray-800 border-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      Left Corner: {leftFighter.name} {leftFighter.icon}
                    </h3>
                    <div
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${getColorClass(
                        leftFighter.color,
                        true,
                      )}`}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{leftFighter.icon}</div>
                        <div>
                          <div className="font-medium">{leftFighter.name}</div>
                          <div className="text-sm text-gray-400">{leftFighter.symbol}</div>
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 rounded bg-gray-800">
                        ${formatPrice(cryptoPrices[leftFighter.id])}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      Right Corner: {rightFighter.name} {rightFighter.icon}
                    </h3>
                    <div
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${getColorClass(
                        rightFighter.color,
                        true,
                      )}`}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{rightFighter.icon}</div>
                        <div>
                          <div className="font-medium">{rightFighter.name}</div>
                          <div className="text-sm text-gray-400">{rightFighter.symbol}</div>
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 rounded bg-gray-800">
                        ${formatPrice(cryptoPrices[rightFighter.id])}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1">
                  {filteredFighters.map((fighter) => (
                    <div
                      key={fighter.id}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
                        (leftFighter.id === fighter.id) || (rightFighter.id === fighter.id)
                          ? getColorClass(fighter.color, true)
                          : getColorClass(fighter.color, false)
                      }`}
                      onClick={() => handleSelectFighter(fighter, leftFighter.id === fighter.id ? "left" : "right")}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{fighter.icon}</div>
                        <div>
                          <div className="font-medium truncate">{fighter.name}</div>
                          <div className="text-sm text-gray-400">{fighter.symbol}</div>
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 rounded bg-gray-800">
                        ${formatPrice(cryptoPrices[fighter.id])}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trending">
                <div className="p-8 text-center text-gray-500">Trending data will be available in the next update</div>
              </TabsContent>

              <TabsContent value="gainers">
                <div className="p-8 text-center text-gray-500">Gainers data will be available in the next update</div>
              </TabsContent>

              <TabsContent value="losers">
                <div className="p-8 text-center text-gray-500">Losers data will be available in the next update</div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleContinue}
            >
              Continue with Selected Fighters
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

