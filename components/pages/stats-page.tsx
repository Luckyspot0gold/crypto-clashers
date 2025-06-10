"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, Trophy, Wallet, Zap } from "lucide-react"
import MarketStats from "@/components/market-stats"
import BettingInterface from "@/components/betting-interface"
import FighterSelector from "@/components/fighter-selector"
import Jumbotron from "@/components/jumbotron"
import Achievements from "@/components/achievements"
import WalletConnector from "@/components/wallet-connector"
import { fetchCryptoData, availableFighters } from "@/lib/crypto-api"
import type { CandlestickData } from "@/lib/types"
import { marketMeleeFormula } from "@/lib/market-melee-formula"

interface StatsPageProps {
  leftFighter: any
  rightFighter: any
  userBalance: number
  userStats: {
    matchesPlayed: number
    matchesWon: number
    totalBets: number
    highestWin: number
  }
  isWalletConnected: boolean
  walletAddress: string
  onSelectFighters: (left: any, right: any) => void
  onPlaceBet: (fighter: string, amount: number) => void
  onDisconnectWallet: () => void
  onStartDemo: () => void
}

export default function StatsPage({
  leftFighter,
  rightFighter,
  userBalance,
  userStats,
  isWalletConnected,
  walletAddress,
  onSelectFighters,
  onPlaceBet,
  onDisconnectWallet,
  onStartDemo,
}: StatsPageProps) {
  const [fighterData, setFighterData] = useState<Record<string, CandlestickData[]>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showFighterSelector, setShowFighterSelector] = useState(false)
  const [activeTab, setActiveTab] = useState("stats")

  // Leaderboard data
  const leaderboard = [
    { name: "Bitcoin", wins: 124, icon: "🐂" },
    { name: "Ethereum", wins: 98, icon: "🦊" },
    { name: "Solana", wins: 87, icon: "🐻" },
    { name: "Dogecoin", wins: 45, icon: "🐕" },
    { name: "Cardano", wins: 32, icon: "🦋" },
    { name: "Polygon", wins: 28, icon: "⭐" },
    { name: "Avalanche", wins: 21, icon: "❄️" },
    { name: "Polkadot", wins: 19, icon: "⚫" },
  ]

  // Fetch data for all fighters
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        // Create an object to store all fighter data
        const allData: Record<string, CandlestickData[]> = {}

        // Fetch data for all available fighters
        const fetchPromises = availableFighters.map(async (fighter) => {
          const data = await fetchCryptoData(fighter.id)
          allData[fighter.id] = data
        })

        await Promise.all(fetchPromises)

        setFighterData(allData)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error fetching crypto data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()

    // Set up polling for data updates (every 30 seconds)
    const intervalId = setInterval(fetchAllData, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Get data for current fighters
  const leftData = fighterData[leftFighter.id] || []
  const rightData = fighterData[rightFighter.id] || []

  // Calculate current market performance for both cryptocurrencies
  const leftPerformance =
    leftData.length > 0
      ? calculatePerformance(leftData[leftData.length - 1], leftData.slice(0, -1), leftFighter.id)
      : null

  const rightPerformance =
    rightData.length > 0
      ? calculatePerformance(rightData[rightData.length - 1], rightData.slice(0, -1), rightFighter.id)
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500">
            Crypto Clashers™ - KryptO Boxing Arena
          </h1>
          <div className="flex items-center gap-4">
            <Achievements userStats={userStats} />

            <WalletConnector
              userBalance={userBalance}
              onConnectWallet={() => {}}
              onDisconnectWallet={onDisconnectWallet}
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        {loading && Object.keys(fighterData).length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading market data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Jumbotron */}
            <Jumbotron
              leftFighter={leftFighter}
              rightFighter={rightFighter}
              leftData={leftData}
              rightData={rightData}
              leftPerformance={leftPerformance}
              rightPerformance={rightPerformance}
              matchRound={0}
              isMatchActive={false}
              winner={null}
              leaderboard={leaderboard}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
                <TabsTrigger value="stats" className="flex items-center">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Market Stats
                </TabsTrigger>
                <TabsTrigger value="betting" className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Betting
                </TabsTrigger>
                <TabsTrigger value="fighters" className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Fighters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableFighters.slice(0, 6).map((fighter) => {
                    const data = fighterData[fighter.id] || []
                    const performance =
                      data.length > 0
                        ? calculatePerformance(data[data.length - 1], data.slice(0, -1), fighter.id)
                        : null

                    return (
                      <MarketStats
                        key={fighter.id}
                        title={`${fighter.name} (${fighter.symbol})`}
                        data={data}
                        performance={performance}
                        color={fighter.color}
                      />
                    )
                  })}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setActiveTab("betting")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue to Betting
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="betting" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BettingInterface
                    leftFighter={leftFighter.name}
                    rightFighter={rightFighter.name}
                    isMatchActive={false}
                    userBalance={userBalance}
                    onPlaceBet={onPlaceBet}
                    defaultTab="bet"
                  />

                  <Card className="bg-gray-900 border-gray-800 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-green-400" />
                      Your Stats
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400">Balance</div>
                        <div className="text-2xl font-bold text-green-400">{userBalance} STYRD</div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400">Matches Won</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {userStats.matchesWon}/{userStats.matchesPlayed}
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400">Total Bets</div>
                        <div className="text-2xl font-bold text-blue-400">{userStats.totalBets}</div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400">Highest Win</div>
                        <div className="text-2xl font-bold text-purple-400">{userStats.highestWin} STYRD</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        onClick={onStartDemo}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Start Demo Match
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fighters">
                <FighterSelector
                  onSelectFighters={(left, right) => {
                    onSelectFighters(left, right)
                    setActiveTab("betting")
                  }}
                  currentLeftFighter={leftFighter}
                  currentRightFighter={rightFighter}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 p-4">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>Crypto Clashers™ © {new Date().getFullYear()} - StoneYard.Gaming - All Rights Reserved.</p>
          <p>Market data updates every 30 seconds. STYRD tokens are for demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}

// Helper function to calculate performance metrics from candlestick data
function calculatePerformance(candle: CandlestickData, previousCandles: CandlestickData[], fighterId?: string) {
  // Use the proprietary Market Melee formula
  return marketMeleeFormula(candle, previousCandles, fighterId)
}

