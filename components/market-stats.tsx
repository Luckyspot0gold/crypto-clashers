"use client"

import { useEffect, useRef } from "react"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react"
import type { CandlestickData } from "@/lib/types"

interface MarketStatsProps {
  title: string
  data: CandlestickData[]
  performance: any | null
  color: string
}

export default function MarketStats({ title, data, performance, color }: MarketStatsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw candlestick chart
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 20
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Find min and max values
    let minPrice = Number.POSITIVE_INFINITY
    let maxPrice = Number.NEGATIVE_INFINITY

    data.forEach((candle) => {
      minPrice = Math.min(minPrice, candle.low)
      maxPrice = Math.max(maxPrice, candle.high)
    })

    // Add some margin to min/max
    const priceRange = maxPrice - minPrice
    minPrice = minPrice - priceRange * 0.1
    maxPrice = maxPrice + priceRange * 0.1

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

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + chartWidth * (i / 4)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw candlesticks
    const candleWidth = chartWidth / data.length

    data.forEach((candle, i) => {
      const x = padding + i * candleWidth

      // Calculate y positions
      const openY = padding + chartHeight - ((candle.open - minPrice) / (maxPrice - minPrice)) * chartHeight
      const closeY = padding + chartHeight - ((candle.close - minPrice) / (maxPrice - minPrice)) * chartHeight
      const highY = padding + chartHeight - ((candle.high - minPrice) / (maxPrice - minPrice)) * chartHeight
      const lowY = padding + chartHeight - ((candle.low - minPrice) / (maxPrice - minPrice)) * chartHeight

      // Draw wick
      ctx.strokeStyle = candle.close >= candle.open ? "#48bb78" : "#f56565"
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = candle.close >= candle.open ? "#48bb78" : "#f56565"
      const candleHeight = Math.abs(closeY - openY)
      ctx.fillRect(
        x + candleWidth * 0.2,
        Math.min(openY, closeY),
        candleWidth * 0.6,
        Math.max(1, candleHeight), // Ensure minimum height of 1px
      )
    })
  }, [data])

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    return price > 1000
      ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : price > 100
        ? price.toLocaleString(undefined, { maximumFractionDigits: 1 })
        : price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  // Get the latest price
  const latestPrice = data.length > 0 ? data[data.length - 1].close : 0

  // Get color classes based on the provided color
  const getColorClasses = (baseColor: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" },
      purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
      blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
      green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500" },
      red: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500" },
    }

    return colorMap[baseColor] || colorMap.blue
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${performance?.isPositive ? "text-green-500" : "text-red-500"}`}>
              ${formatPrice(latestPrice)}
            </span>
            {performance && (
              <span
                className={`flex items-center text-sm ${performance.isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {performance.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(performance.percentChange).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <canvas ref={canvasRef} width={400} height={200} className="w-full h-[200px]" />
      </div>

      {performance && (
        <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-800">
          <div>
            <div className="text-sm text-gray-400 mb-1">Volatility</div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClasses.bg}`}
                style={{ width: `${Math.min(100, performance.volatility * 5)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Momentum</div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${performance.momentum >= 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{
                  width: `${Math.min(100, Math.abs(performance.momentum))}%`,
                  marginLeft: performance.momentum < 0 ? "auto" : "0",
                }}
              />
            </div>
          </div>

          <div className="col-span-2 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {performance.isBullish ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                ) : performance.isBearish ? (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                ) : null}
                <span className="text-sm">
                  {performance.isBullish
                    ? "Strong Bullish"
                    : performance.isBearish
                      ? "Strong Bearish"
                      : performance.isPositive
                        ? "Slightly Bullish"
                        : "Slightly Bearish"}
                </span>
              </div>
              <div className="text-sm text-gray-400">Vol: {(performance.volume / 1000000).toFixed(1)}M</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

