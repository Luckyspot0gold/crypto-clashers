"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Trophy, Star, Zap, BarChart2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CandlestickData } from "@/lib/types"

interface JumbotronProps {
  leftFighter: {
    id: string
    name: string
    symbol: string
    icon: string
    color: string
  }
  rightFighter: {
    id: string
    name: string
    symbol: string
    icon: string
    color: string
  }
  leftData: CandlestickData[]
  rightData: CandlestickData[]
  leftPerformance: any | null
  rightPerformance: any | null
  matchRound: number
  isMatchActive: boolean
  winner: string | null
  leaderboard: {
    name: string
    wins: number
    icon: string
  }[]
}

export default function Jumbotron({
  leftFighter,
  rightFighter,
  leftData,
  rightData,
  leftPerformance,
  rightPerformance,
  matchRound,
  isMatchActive,
  winner,
  leaderboard,
}: JumbotronProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [highlightedStat, setHighlightedStat] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    return price > 1000
      ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : price > 100
        ? price.toLocaleString(undefined, { maximumFractionDigits: 1 })
        : price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  // Get color from name
  const getColorFromName = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      orange: "#F97316",
      purple: "#8B5CF6",
      blue: "#3B82F6",
      red: "#EF4444",
      green: "#10B981",
      yellow: "#FACC15",
      gray: "#6B7280",
      pink: "#EC4899",
      black: "#1F2937",
    }

    return colorMap[colorName] || "#6B7280"
  }

  // Draw mini chart
  useEffect(() => {
    if (!canvasRef.current || !leftData.length || !rightData.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 10
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Draw grid
    ctx.strokeStyle = "#2d3748"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + chartHeight * (i / 4)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw left fighter line (last 10 candles)
    const leftPrices = leftData.slice(-10).map((candle) => candle.close)
    const rightPrices = rightData.slice(-10).map((candle) => candle.close)

    // Find min and max for both datasets
    const allPrices = [...leftPrices, ...rightPrices]
    const minPrice = Math.min(...allPrices) * 0.99
    const maxPrice = Math.max(...allPrices) * 1.01
    const priceRange = maxPrice - minPrice

    // Draw left fighter line
    ctx.strokeStyle = getColorFromName(leftFighter.color)
    ctx.lineWidth = 3
    ctx.beginPath()
    leftPrices.forEach((price, i) => {
      const x = padding + (i / (leftPrices.length - 1)) * chartWidth
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw right fighter line
    ctx.strokeStyle = getColorFromName(rightFighter.color)
    ctx.lineWidth = 3
    ctx.beginPath()
    rightPrices.forEach((price, i) => {
      const x = padding + (i / (rightPrices.length - 1)) * chartWidth
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }, [leftData, rightData, leftFighter.color, rightFighter.color])

  // Cycle through highlighted stats
  useEffect(() => {
    if (!isMatchActive) return

    const stats = ["price", "momentum", "volatility", "volume"]
    let currentIndex = 0

    const interval = setInterval(() => {
      setHighlightedStat(stats[currentIndex])
      currentIndex = (currentIndex + 1) % stats.length
    }, 3000)

    return () => clearInterval(interval)
  }, [isMatchActive])

  // Get latest prices
  const leftPrice = leftData.length > 0 ? leftData[leftData.length - 1].close : 0
  const rightPrice = rightData.length > 0 ? rightData[rightData.length - 1].close : 0

  return (
    <Card className="relative overflow-hidden bg-gray-900 border-gray-800 shadow-2xl">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 z-0"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center opacity-10 z-0"></div>

      {/* Neon border effect */}
      <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] z-0"></div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart2 className="mr-2 h-6 w-6 text-blue-400" />
            CRYPTO CLASHERS™ JUMBOTRON
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
            >
              <Trophy className="mr-1 h-4 w-4 text-yellow-400" />
              {showLeaderboard ? "Hide" : "Show"} Leaderboard
            </button>

            {isMatchActive && (
              <div className="bg-yellow-600 text-white px-3 py-1 rounded-md flex items-center text-sm">
                <Zap className="mr-1 h-4 w-4" />
                Round {matchRound}/5
              </div>
            )}

            {winner && (
              <div className="bg-green-600 text-white px-3 py-1 rounded-md flex items-center text-sm">
                <Trophy className="mr-1 h-4 w-4 text-yellow-400" />
                {winner === "DRAW" ? "DRAW" : `${winner} WINS!`}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showLeaderboard ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4"
            >
              <h3 className="text-xl font-bold text-center mb-4 text-yellow-400 flex items-center justify-center">
                <Trophy className="mr-2 h-5 w-5" />
                CRYPTO CHAMPIONS LEADERBOARD
              </h3>

              <div className="grid grid-cols-4 gap-4">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg",
                      index === 0
                        ? "bg-yellow-900/50 border border-yellow-500"
                        : index === 1
                          ? "bg-gray-700/50 border border-gray-400"
                          : index === 2
                            ? "bg-amber-800/50 border border-amber-600"
                            : "bg-gray-800/50 border border-gray-700",
                    )}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-gray-400">{item.wins} wins</div>
                    {index < 3 && (
                      <div className="mt-1">
                        {Array(3 - index)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="inline h-4 w-4 text-yellow-400" />
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Left Fighter Stats */}
              <div
                className="backdrop-blur-sm rounded-lg p-4 border"
                style={{
                  background: `linear-gradient(to bottom right, ${getColorFromName(leftFighter.color)}40, ${getColorFromName(leftFighter.color)}20)`,
                  borderColor: `${getColorFromName(leftFighter.color)}80`,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold" style={{ color: getColorFromName(leftFighter.color) }}>
                    {leftFighter.name} {leftFighter.icon}
                  </h3>
                  <div
                    className={`text-lg font-bold ${leftPerformance?.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    ${formatPrice(leftPrice)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "price" ? `bg-${leftFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "price" ? { backgroundColor: `${getColorFromName(leftFighter.color)}30` } : {}
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Change</span>
                      <span
                        className={`flex items-center ${leftPerformance?.isPositive ? "text-green-500" : "text-red-500"}`}
                      >
                        {leftPerformance?.isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(leftPerformance?.percentChange || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "momentum" ? `bg-${leftFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "momentum"
                        ? { backgroundColor: `${getColorFromName(leftFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="text-sm text-gray-400 mb-1">Momentum</div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${leftPerformance?.momentum >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{
                          width: `${Math.min(100, Math.abs(leftPerformance?.momentum || 0))}%`,
                          marginLeft: leftPerformance?.momentum < 0 ? "auto" : "0",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "volatility" ? `bg-${leftFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "volatility"
                        ? { backgroundColor: `${getColorFromName(leftFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="text-sm text-gray-400 mb-1">Volatility</div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, (leftPerformance?.volatility || 0) * 5)}%`,
                          backgroundColor: getColorFromName(leftFighter.color),
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "volume" ? `bg-${leftFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "volume"
                        ? { backgroundColor: `${getColorFromName(leftFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Volume</span>
                      <span className="text-sm">{((leftPerformance?.volume || 0) / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Chart with Top-Down View */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 flex flex-col">
                <h3 className="text-lg font-bold text-center mb-2">Live Price Comparison & Match View</h3>
                <div className="relative">
                  <canvas ref={canvasRef} width={400} height={200} className="w-full" />

                  {/* Top-down boxing ring overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Boxing ring */}
                    <div className="absolute inset-4 border-4 border-gray-600 rounded-full bg-gray-800/30">
                      {/* Ring ropes */}
                      <div className="absolute inset-2 border-2 border-dashed border-gray-500 rounded-full"></div>

                      {/* Left fighter (top-down view) */}
                      <motion.div
                        className="absolute w-12 h-12 rounded-full"
                        style={{
                          backgroundColor: getColorFromName(leftFighter.color),
                          opacity: 0.8,
                          left: "25%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        animate={{
                          x:
                            leftPerformance?.action === "jab"
                              ? 20
                              : leftPerformance?.action === "hook"
                                ? 30
                                : leftPerformance?.action === "uppercut"
                                  ? 40
                                  : leftPerformance?.action === "dodge"
                                    ? -15
                                    : 0,
                          scale: leftPerformance?.action === "block" ? 0.8 : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          yoyo: leftPerformance?.action !== "dodge" ? 1 : 0,
                          repeat: leftPerformance?.action !== "dodge" ? 1 : 0,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                          {leftFighter.icon}
                        </div>

                        {/* Fighter's attack visualization */}
                        {leftPerformance?.action === "jab" && (
                          <div className="absolute top-1/2 left-full w-6 h-1 bg-yellow-400 rounded-full transform -translate-y-1/2"></div>
                        )}
                        {leftPerformance?.action === "hook" && (
                          <div className="absolute top-1/2 left-full w-8 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 rotate-12"></div>
                        )}
                        {leftPerformance?.action === "uppercut" && (
                          <div className="absolute top-1/2 left-full w-10 h-3 bg-red-500 rounded-full transform -translate-y-1/2"></div>
                        )}
                      </motion.div>

                      {/* Right fighter (top-down view) */}
                      <motion.div
                        className="absolute w-12 h-12 rounded-full"
                        style={{
                          backgroundColor: getColorFromName(rightFighter.color),
                          opacity: 0.8,
                          left: "75%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        animate={{
                          x:
                            rightPerformance?.action === "jab"
                              ? -20
                              : rightPerformance?.action === "hook"
                                ? -30
                                : rightPerformance?.action === "uppercut"
                                  ? -40
                                  : rightPerformance?.action === "dodge"
                                    ? 15
                                    : 0,
                          scale: rightPerformance?.action === "block" ? 0.8 : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          yoyo: rightPerformance?.action !== "dodge" ? 1 : 0,
                          repeat: rightPerformance?.action !== "dodge" ? 1 : 0,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                          {rightFighter.icon}
                        </div>

                        {/* Fighter's attack visualization */}
                        {rightPerformance?.action === "jab" && (
                          <div className="absolute top-1/2 right-full w-6 h-1 bg-yellow-400 rounded-full transform -translate-y-1/2"></div>
                        )}
                        {rightPerformance?.action === "hook" && (
                          <div className="absolute top-1/2 right-full w-8 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 -rotate-12"></div>
                        )}
                        {rightPerformance?.action === "uppercut" && (
                          <div className="absolute top-1/2 right-full w-10 h-3 bg-red-500 rounded-full transform -translate-y-1/2"></div>
                        )}
                      </motion.div>
                    </div>

                    {/* Move legend */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 text-xs">
                      <span className="px-1 bg-yellow-400/30 rounded">Jab</span>
                      <span className="px-1 bg-orange-500/30 rounded">Hook</span>
                      <span className="px-1 bg-red-500/30 rounded">Uppercut</span>
                      <span className="px-1 bg-blue-500/30 rounded">Dodge</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-2 space-x-4 text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: getColorFromName(leftFighter.color) }}
                    ></div>
                    <span>{leftFighter.symbol}</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: getColorFromName(rightFighter.color) }}
                    ></div>
                    <span>{rightFighter.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Right Fighter Stats */}
              <div
                className="backdrop-blur-sm rounded-lg p-4 border"
                style={{
                  background: `linear-gradient(to bottom right, ${getColorFromName(rightFighter.color)}40, ${getColorFromName(rightFighter.color)}20)`,
                  borderColor: `${getColorFromName(rightFighter.color)}80`,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold" style={{ color: getColorFromName(rightFighter.color) }}>
                    {rightFighter.name} {rightFighter.icon}
                  </h3>
                  <div
                    className={`text-lg font-bold ${rightPerformance?.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    ${formatPrice(rightPrice)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "price" ? `bg-${rightFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "price"
                        ? { backgroundColor: `${getColorFromName(rightFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Change</span>
                      <span
                        className={`flex items-center ${rightPerformance?.isPositive ? "text-green-500" : "text-red-500"}`}
                      >
                        {rightPerformance?.isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(rightPerformance?.percentChange || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "momentum" ? `bg-${rightFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "momentum"
                        ? { backgroundColor: `${getColorFromName(rightFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="text-sm text-gray-400 mb-1">Momentum</div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${rightPerformance?.momentum >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{
                          width: `${Math.min(100, Math.abs(rightPerformance?.momentum || 0))}%`,
                          marginLeft: rightPerformance?.momentum < 0 ? "auto" : "0",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "volatility" ? `bg-${rightFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "volatility"
                        ? { backgroundColor: `${getColorFromName(rightFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="text-sm text-gray-400 mb-1">Volatility</div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, (rightPerformance?.volatility || 0) * 5)}%`,
                          backgroundColor: getColorFromName(rightFighter.color),
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-300",
                      highlightedStat === "volume" ? `bg-${rightFighter.color}-900/50 p-2 rounded-md -mx-2` : "",
                    )}
                    style={
                      highlightedStat === "volume"
                        ? { backgroundColor: `${getColorFromName(rightFighter.color)}30` }
                        : {}
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Volume</span>
                      <span className="text-sm">{((rightPerformance?.volume || 0) / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

