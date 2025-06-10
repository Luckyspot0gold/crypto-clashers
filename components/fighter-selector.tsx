"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, TrendingDown, Star, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { availableFighters } from "@/lib/crypto-api"

interface FighterSelectorProps {
  onSelectFighters: (leftFighter: any, rightFighter: any) => void
  currentLeftFighter: any
  currentRightFighter: any
}

export default function FighterSelector({
  onSelectFighters,
  currentLeftFighter,
  currentRightFighter,
}: FighterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [leftFighter, setLeftFighter] = useState(currentLeftFighter)
  const [rightFighter, setRightFighter] = useState(currentRightFighter)
  const [selectingFor, setSelectingFor] = useState<"left" | "right">("left")

  // Filter fighters based on search term
  const filteredFighters = availableFighters.filter(
    (fighter) =>
      fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle fighter selection
  const handleSelectFighter = (fighter: any) => {
    if (selectingFor === "left") {
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

  // Confirm fighter selection
  const confirmSelection = () => {
    onSelectFighters(leftFighter, rightFighter)
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
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-400" />
          Select Fighters
        </CardTitle>
        <CardDescription>Choose from the top 30 cryptocurrencies to battle in the arena</CardDescription>
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
              <TabsTrigger value="recent">
                <Clock className="mr-1 h-4 w-4" />
                Recent
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
                  onClick={() => setSelectingFor("left")}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-2">{leftFighter.icon}</div>
                    <div>
                      <div className="font-medium">{leftFighter.name}</div>
                      <div className="text-sm text-gray-400">{leftFighter.symbol}</div>
                    </div>
                  </div>
                  <div className="text-sm px-2 py-1 rounded bg-gray-800">
                    {selectingFor === "left" ? "Selecting" : "Click to change"}
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
                  onClick={() => setSelectingFor("right")}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-2">{rightFighter.icon}</div>
                    <div>
                      <div className="font-medium">{rightFighter.name}</div>
                      <div className="text-sm text-gray-400">{rightFighter.symbol}</div>
                    </div>
                  </div>
                  <div className="text-sm px-2 py-1 rounded bg-gray-800">
                    {selectingFor === "right" ? "Selecting" : "Click to change"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1">
              {filteredFighters.map((fighter) => (
                <div
                  key={fighter.id}
                  className={`p-3 rounded-lg border flex items-center cursor-pointer ${
                    (selectingFor === "left" && leftFighter.id === fighter.id) ||
                    (selectingFor === "right" && rightFighter.id === fighter.id)
                      ? getColorClass(fighter.color, true)
                      : getColorClass(fighter.color, false)
                  }`}
                  onClick={() => handleSelectFighter(fighter)}
                >
                  <div className="text-2xl mr-2">{fighter.icon}</div>
                  <div>
                    <div className="font-medium truncate">{fighter.name}</div>
                    <div className="text-sm text-gray-400">{fighter.symbol}</div>
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

          <TabsContent value="recent">
            <div className="p-8 text-center text-gray-500">Recent battles will be available in the next update</div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={confirmSelection}
        >
          Confirm Fighters
        </Button>
      </CardFooter>
    </Card>
  )
}

