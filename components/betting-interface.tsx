"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, ArrowRight, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BettingInterfaceProps {
  leftFighter: string
  rightFighter: string
  isMatchActive: boolean
  userBalance: number
  onPlaceBet: (fighter: string, amount: number) => void
  defaultTab?: "info" | "bet"
}

export default function BettingInterface({
  leftFighter,
  rightFighter,
  isMatchActive,
  userBalance,
  onPlaceBet,
  defaultTab = "bet",
}: BettingInterfaceProps) {
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState<number>(10)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "bet">(defaultTab)

  // Set default selected fighter when component mounts
  useEffect(() => {
    if (!selectedFighter) {
      setSelectedFighter(leftFighter)
    }
  }, [leftFighter, selectedFighter])

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setBetAmount(value)
    } else {
      setBetAmount(0)
    }
  }

  const handleSelectFighter = (fighter: string) => {
    if (isMatchActive) return
    setSelectedFighter(fighter)
  }

  const handlePlaceBet = () => {
    if (!selectedFighter || betAmount <= 0 || betAmount > userBalance || isMatchActive) return

    setShowConfirmation(true)
  }

  const confirmBet = () => {
    if (!selectedFighter) return

    onPlaceBet(selectedFighter, betAmount)
    setShowConfirmation(false)
  }

  const cancelBet = () => {
    setShowConfirmation(false)
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          Place Your Bet
        </CardTitle>
        <CardDescription>
          Current Balance: <span className="font-bold text-green-400">{userBalance} STYRD</span>
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "info" | "bet")}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="bet">Place Bet</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="p-6 pt-4">
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">How Betting Works</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Select a fighter you think will win</li>
                <li>• Choose your bet amount (min: 1 STYRD)</li>
                <li>• If your fighter wins, you get 2x your bet</li>
                <li>• If your fighter loses, you lose your bet</li>
                <li>• In case of a draw, your bet is refunded</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Odds & Payouts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Win</div>
                  <div className="font-bold text-green-400">2x your bet</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Loss</div>
                  <div className="font-bold text-red-400">0x (lose bet)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Draw</div>
                  <div className="font-bold text-yellow-400">1x (refund)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Max Win</div>
                  <div className="font-bold text-purple-400">{userBalance * 2} STYRD</div>
                </div>
              </div>
            </div>

            <Button onClick={() => setActiveTab("bet")} className="w-full flex items-center justify-center">
              Place a Bet
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="bet">
          <CardContent>
            {showConfirmation ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-lg mb-2">Confirm your bet:</p>
                  <p className="font-bold text-xl mb-1">
                    {betAmount} STYRD on {selectedFighter}
                  </p>
                  <p className="text-sm text-gray-400">This action cannot be undone once the match starts.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={cancelBet}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={confirmBet}>
                    Confirm Bet
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Select Fighter</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedFighter === leftFighter ? "default" : "outline"}
                      className={`h-16 ${selectedFighter === leftFighter ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                      onClick={() => handleSelectFighter(leftFighter)}
                      disabled={isMatchActive}
                    >
                      <div className="flex flex-col items-center">
                        <span>{leftFighter} Bull</span>
                        <span className="text-xs">Bitcoin</span>
                      </div>
                    </Button>
                    <Button
                      variant={selectedFighter === rightFighter ? "default" : "outline"}
                      className={`h-16 ${selectedFighter === rightFighter ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                      onClick={() => handleSelectFighter(rightFighter)}
                      disabled={isMatchActive}
                    >
                      <div className="flex flex-col items-center">
                        <span>{rightFighter} Bear</span>
                        <span className="text-xs">Solana</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Bet Amount (STYRD)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      disabled={isMatchActive}
                      className="bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setBetAmount(Math.max(1, Math.floor(userBalance * 0.1)))}
                      disabled={isMatchActive}
                    >
                      10%
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBetAmount(Math.max(1, Math.floor(userBalance * 0.5)))}
                      disabled={isMatchActive}
                    >
                      50%
                    </Button>
                    <Button variant="outline" onClick={() => setBetAmount(userBalance)} disabled={isMatchActive}>
                      Max
                    </Button>
                  </div>
                  {betAmount > userBalance && <p className="text-red-500 text-sm mt-1">Insufficient balance</p>}
                </div>
              </>
            )}
          </CardContent>
          {!showConfirmation && (
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={handlePlaceBet}
                disabled={!selectedFighter || betAmount <= 0 || betAmount > userBalance || isMatchActive}
              >
                {isMatchActive ? (
                  "Match in progress"
                ) : (
                  <>
                    Place Bet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

