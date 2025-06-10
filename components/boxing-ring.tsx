"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"
import type { CandlestickData } from "@/lib/types"
import Image from "next/image"

interface BoxingRingProps {
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
  leftAction: string
  rightAction: string
  leftPerformance: any | null
  rightPerformance: any | null
  gameSpeed: number
  leftData: CandlestickData[]
  rightData: CandlestickData[]
  userControls: {
    leftPower: number
    rightPower: number
    leftCombo?: number
    rightCombo?: number
    leftLastMove?: string
    rightLastMove?: string
    leftSpecialCharged?: boolean
    rightSpecialCharged?: boolean
  }
  onUserAction: (action: string, fighter: "left" | "right") => void
  cameraAngle?: "side" | "forward"
  betOn?: string | null
}

export default function BoxingRing({
  leftFighter,
  rightFighter,
  leftAction,
  rightAction,
  leftPerformance,
  rightPerformance,
  gameSpeed,
  leftData,
  rightData,
  userControls,
  onUserAction,
  cameraAngle = "side",
  betOn = null,
}: BoxingRingProps) {
  const [leftHealth, setLeftHealth] = useState(100)
  const [rightHealth, setRightHealth] = useState(100)
  const [winner, setWinner] = useState<string | null>(null)
  const [roundTime, setRoundTime] = useState(60) // 60 second rounds
  const animationRef = useRef<number | null>(null)
  const lastUpdateTime = useRef<number>(Date.now())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [leftAnimationState, setLeftAnimationState] = useState("idle")
  const [rightAnimationState, setRightAnimationState] = useState("idle")
  const [isMatchActive, setIsMatchActive] = useState(true) // Track if the match is active

  // Reset the match every hour
  useEffect(() => {
    const resetMatch = () => {
      setLeftHealth(100)
      setRightHealth(100)
      setWinner(null)
      setRoundTime(60)
      setIsMatchActive(true) // Reset match state
    }

    const hourlyReset = setInterval(resetMatch, 60 * 60 * 1000) // Reset every hour

    return () => clearInterval(hourlyReset)
  }, [])

  // Update fighter animation states based on actions
  useEffect(() => {
    if (leftAction) {
      setLeftAnimationState(leftAction)
      setTimeout(() => setLeftAnimationState("idle"), 1000)
    }

    if (rightAction) {
      setRightAnimationState(rightAction)
      setTimeout(() => setRightAnimationState("idle"), 1000)
    }
  }, [leftAction, rightAction])

  // Update health based on actions
  useEffect(() => {
    if (winner) return

    // Calculate damage based on performance and action
    const calculateDamage = (
      action: string,
      performance: any | null,
      userPower: number,
      combo = 0,
      specialCharged = false,
    ) => {
      if (!performance) return 0

      let baseDamage =
        {
          jab: 2,
          hook: 3,
          uppercut: 5,
          punch: 2, // Keep for backward compatibility
          dodge: 0,
          block: 0,
          stagger: 0,
          idle: 0,
        }[action] || 0

      // Apply combo multiplier (20% increase per combo level)
      if (combo > 1) {
        baseDamage *= 1 + (combo - 1) * 0.2
      }

      // Apply special charged bonus for uppercut
      if (specialCharged && action === "uppercut") {
        baseDamage *= 2 // Double damage for charged uppercut
      }

      // Apply Fury Mode multiplier for Solana
      if (performance.isFuryMode) {
        baseDamage *= 2 // Double damage in Fury Mode
      }

      // Modify damage based on market performance
      const volatilityMultiplier = 1 + performance.volatility / 100
      const momentumMultiplier = 1 + Math.abs(performance.momentum) / 200

      // Add user power to the damage calculation
      const userMultiplier = 1 + userPower / 100

      return baseDamage * volatilityMultiplier * momentumMultiplier * userMultiplier
    }

    const leftDamage = calculateDamage(
      leftAction,
      leftPerformance,
      userControls.leftPower,
      userControls.leftCombo,
      userControls.leftSpecialCharged,
    )

    const rightDamage = calculateDamage(
      rightAction,
      rightPerformance,
      userControls.rightPower,
      userControls.rightCombo,
      userControls.rightSpecialCharged,
    )

    // Apply damage if the opponent isn't blocking/dodging
    if (rightAction !== "block" && rightAction !== "dodge") {
      setRightHealth((prev) => Math.max(0, prev - leftDamage))
    }

    if (leftAction !== "block" && leftAction !== "dodge") {
      setLeftHealth((prev) => Math.max(0, prev - rightDamage))
    }
  }, [leftAction, rightAction, leftPerformance, rightPerformance, winner, userControls])

  // Check for winner
  useEffect(() => {
    if (leftHealth <= 0) {
      setWinner(rightFighter.name)
      setIsMatchActive(false) // Set match to inactive
    } else if (rightHealth <= 0) {
      setWinner(leftFighter.name)
      setIsMatchActive(false) // Set match to inactive
    }
  }, [leftHealth, rightHealth, leftFighter.name, rightFighter.name])

  // Countdown timer
  useEffect(() => {
    const updateTimer = (timestamp: number) => {
      if (!lastUpdateTime.current) {
        lastUpdateTime.current = timestamp
      }

      const deltaTime = timestamp - lastUpdateTime.current

      // Apply game speed to timer
      if (deltaTime > 1000 / gameSpeed) {
        setRoundTime((prev) => {
          const newTime = Math.max(0, prev - 1)
          if (newTime === 0 && !winner) {
            // Determine winner by health if time runs out
            if (leftHealth > rightHealth) {
              setWinner(leftFighter.name)
              setIsMatchActive(false) // Set match to inactive
            } else if (rightHealth > leftHealth) {
              setWinner(rightFighter.name)
              setIsMatchActive(false) // Set match to inactive
            } else {
              setWinner("Draw")
              setIsMatchActive(false) // Set match to inactive
            }
          }
          return newTime
        })
        lastUpdateTime.current = timestamp
      }

      animationRef.current = requestAnimationFrame(updateTimer)
    }

    animationRef.current = requestAnimationFrame(updateTimer)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameSpeed, winner, leftHealth, rightHealth, leftFighter.name, rightFighter.name])

  // Draw candlestick chart on the arena floor
  useEffect(() => {
    if (!canvasRef.current || !leftData.length || !rightData.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set transparency for background chart
    ctx.globalAlpha = 0.15

    // Draw left fighter candlesticks (in their color)
    const leftColor = getColorFromName(leftFighter.color)
    drawCandlesticks(ctx, leftData.slice(-15), canvas.width, canvas.height, leftColor, 0, canvas.width / 2)

    // Draw right fighter candlesticks (in their color)
    const rightColor = getColorFromName(rightFighter.color)
    drawCandlesticks(ctx, rightData.slice(-15), canvas.width, canvas.height, rightColor, canvas.width / 2, canvas.width)

    // Reset transparency
    ctx.globalAlpha = 1.0
  }, [leftData, rightData, leftFighter.color, rightFighter.color])

  // Helper function to draw candlesticks
  const drawCandlesticks = (
    ctx: CanvasRenderingContext2D,
    data: CandlestickData[],
    width: number,
    height: number,
    color: string,
    startX: number,
    endX: number,
  ) => {
    if (data.length === 0) return

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

    const chartWidth = endX - startX
    const candleWidth = chartWidth / data.length

    // Draw candlesticks
    data.forEach((candle, i) => {
      const x = startX + i * candleWidth

      // Calculate y positions
      const openY = height - ((candle.open - minPrice) / (maxPrice - minPrice)) * height * 0.8
      const closeY = height - ((candle.close - minPrice) / (maxPrice - minPrice)) * height * 0.8
      const highY = height - ((candle.high - minPrice) / (maxPrice - minPrice)) * height * 0.8
      const lowY = height - ((candle.low - minPrice) / (maxPrice - minPrice)) * height * 0.8

      // Draw wick
      ctx.strokeStyle = candle.close >= candle.open ? `${color}` : `${color}88`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = candle.close >= candle.open ? `${color}` : `${color}88`
      const candleHeight = Math.abs(closeY - openY)
      ctx.fillRect(
        x + candleWidth * 0.2,
        Math.min(openY, closeY),
        candleWidth * 0.6,
        Math.max(1, candleHeight), // Ensure minimum height of 1px
      )
    })
  }

  // Helper function to get color from name
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

  // Get animation for boxer based on action
  const getBoxerAnimation = (action: string, isReversed: boolean) => {
    const animations = {
      jab: {
        x: isReversed ? -20 : 20,
        transition: { duration: 0.2, yoyo: 1, repeat: 1 },
      },
      hook: {
        x: isReversed ? -35 : 35,
        rotate: isReversed ? -15 : 15,
        transition: { duration: 0.35, yoyo: 1, repeat: 1 },
      },
      uppercut: {
        y: -30,
        x: isReversed ? -40 : 40,
        transition: { duration: 0.4, yoyo: 1, repeat: 1 },
      },
      dodge: {
        y: 20,
        x: isReversed ? 15 : -15,
        transition: { duration: 0.3, yoyo: 1, repeat: 1 },
      },
      punch: {
        // Keep for backward compatibility
        x: isReversed ? -50 : 50,
        transition: { duration: 0.3, yoyo: 1, repeat: 1 },
      },
      block: {
        scale: 0.95,
        transition: { duration: 0.5 },
      },
      stagger: {
        x: isReversed ? 30 : -30,
        rotate: isReversed ? -10 : 10,
        transition: { duration: 0.5, yoyo: 1, repeat: 1 },
      },
      idle: {
        y: [0, -5, 0],
        transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
      },
    }

    return animations[action] || animations.idle
  }

  // Render impact effects (POW, BANG, etc.)
  const renderImpactEffect = (action: string, isLeft: boolean) => {
    if (action !== "jab" && action !== "hook" && action !== "uppercut" && action !== "punch") return null

    const effectText =
      {
        jab: "POW!",
        hook: "BANG!",
        uppercut: "BOOM!",
        punch: "WHAM!",
      }[action] || "HIT!"

    const effectColor =
      {
        jab: "text-yellow-400",
        hook: "text-orange-500",
        uppercut: "text-red-500",
        punch: "text-blue-500",
      }[action] || "text-white"

    return (
      <AnimatePresence>
        <motion.div
          key={`impact-${Date.now()}`}
          className={`absolute ${isLeft ? "right-1/4" : "left-1/4"} top-1/3 z-10 pointer-events-none`}
          initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
          animate={{ opacity: 1, scale: 1.5, rotate: Math.random() * 40 - 20 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`font-bold text-3xl ${effectColor} drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`}
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            {effectText}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Modify the handleUserAction function to reduce damage
  const handleUserAction = (action: string, fighter: "left" | "right") => {
    if (!isMatchActive) return

    // Play sound for action
    //soundManager.play(action === "jab" ? "button" : "coin");

    // Calculate damage based on move type - REDUCED DAMAGE VALUES
    let baseDamage = 0
    const comboMultiplier = 1
    let moveDescription = ""

    switch (action) {
      case "jab":
        baseDamage = 3 + Math.floor(Math.random() * 3) // 3-5 damage (reduced from 8-12)
        moveDescription = "Quick Jab"
        break
      case "hook":
        baseDamage = 5 + Math.floor(Math.random() * 4) // 5-8 damage (reduced from 12-18)
        moveDescription = "Strong Hook"
        break
      case "uppercut":
        baseDamage = 7 + Math.floor(Math.random() * 5) // 7-11 damage (reduced from 15-25)
        moveDescription = "Powerful Uppercut"
        break
      case "dodge":
        baseDamage = 0
        moveDescription = "Defensive Dodge"
        break
      default:
        baseDamage = 2 + Math.floor(Math.random() * 3) // 2-4 damage (reduced from 5-10)
        moveDescription = action
    }

    onUserAction(action, fighter)
  }

  // Render the boxing ring based on camera angle
  const renderBoxingRing = () => {
    if (cameraAngle === "forward") {
      // Forward view (behind chosen fighter)
      const viewFromBehind = betOn === leftFighter.name ? "left" : "right"

      return (
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          {/* Arena background */}
          <div className="absolute inset-0">
            <Image src="/images/crypto-arena.webp" alt="Crypto Boxing Arena" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Arena floor with charts */}
          <div className="absolute inset-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Ring ropes */}
          <div className="absolute left-0 right-0 h-1/2 border-b-4 border-red-600"></div>
          <div className="absolute left-0 right-0 h-1/3 border-b-4 border-blue-600"></div>
          <div className="absolute left-0 right-0 h-2/3 border-b-4 border-white"></div>

          {/* Ring corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-r-4 border-b-4 border-gray-400"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-b-4 border-gray-400"></div>

          {/* Fighters */}
          {viewFromBehind === "left" ? (
            <>
              {/* View from behind left fighter (seeing right fighter) */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-900 to-transparent"></div>

              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-64 h-64">
                <motion.div
                  animate={getBoxerAnimation(rightAnimationState, false)}
                  style={{
                    filter: winner === leftFighter.name ? "grayscale(1)" : "none",
                    opacity: winner === leftFighter.name ? 0.7 : 1,
                    transform: "scale(1.5)",
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-8xl">{rightFighter.icon}</div>
                </motion.div>

                {/* Impact effect */}
                {renderImpactEffect(leftAction, true)}
              </div>

              {/* Health bar for opponent */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64">
                <div className="text-center mb-1 font-bold" style={{ color: getColorFromName(rightFighter.color) }}>
                  {rightFighter.name} {rightFighter.icon} - {rightHealth}%
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${rightHealth}%`, backgroundColor: getColorFromName(rightFighter.color) }}
                  />
                </div>
              </div>

              {/* Your gloves at bottom of screen */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full">
                <motion.div
                  className="absolute bottom-0 left-1/3 w-16 h-16 bg-red-600 rounded-full border-4 border-red-800"
                  animate={leftAction === "jab" ? { y: -50, x: 50 } : { y: 0, x: 0 }}
                  transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 right-1/3 w-16 h-16 bg-red-600 rounded-full border-4 border-red-800"
                  animate={leftAction === "hook" || leftAction === "uppercut" ? { y: -70, x: -50 } : { y: 0, x: 0 }}
                  transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
                />
              </div>
            </>
          ) : (
            <>
              {/* View from behind right fighter (seeing left fighter) */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-900 to-transparent"></div>

              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-64 h-64">
                <motion.div
                  animate={getBoxerAnimation(leftAnimationState, true)}
                  style={{
                    filter: winner === rightFighter.name ? "grayscale(1)" : "none",
                    opacity: winner === rightFighter.name ? 0.7 : 1,
                    transform: "scale(1.5)",
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-8xl">{leftFighter.icon}</div>
                </motion.div>

                {/* Impact effect */}
                {renderImpactEffect(rightAction, false)}
              </div>

              {/* Health bar for opponent */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64">
                <div className="text-center mb-1 font-bold" style={{ color: getColorFromName(leftFighter.color) }}>
                  {leftFighter.name} {leftFighter.icon} - {leftHealth}%
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${leftHealth}%`, backgroundColor: getColorFromName(leftFighter.color) }}
                  />
                </div>
              </div>

              {/* Your gloves at bottom of screen */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full">
                <motion.div
                  className="absolute bottom-0 left-1/3 w-16 h-16 bg-purple-600 rounded-full border-4 border-purple-800"
                  animate={rightAction === "jab" ? { y: -50, x: 50 } : { y: 0, x: 0 }}
                  transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 right-1/3 w-16 h-16 bg-purple-600 rounded-full border-4 border-purple-800"
                  animate={rightAction === "hook" || rightAction === "uppercut" ? { y: -70, x: -50 } : { y: 0, x: 0 }}
                  transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
                />
              </div>
            </>
          )}
        </div>
      )
    }

    // Default side view
    return (
      <div className="relative rounded-xl overflow-hidden h-[500px]">
        {/* Arena background */}
        <div className="absolute inset-0">
          <Image src="/images/crypto-arena.webp" alt="Crypto Boxing Arena" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Canvas for candlestick chart on arena floor */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-gray-900 bg-opacity-80 rounded-full px-6 py-2 text-xl font-bold">
            Round Time: {Math.floor(roundTime / 60)}:{(roundTime % 60).toString().padStart(2, "0")}
          </div>
        </div>

        {/* Health bars */}
        <div className="absolute top-16 left-4 right-4 flex justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold" style={{ color: getColorFromName(leftFighter.color) }}>
                {leftFighter.name} {leftFighter.icon}
              </span>
              <span>{leftHealth}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${leftHealth}%`, backgroundColor: getColorFromName(leftFighter.color) }}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold" style={{ color: getColorFromName(rightFighter.color) }}>
                {rightFighter.name} {rightFighter.icon}
              </span>
              <span>{rightHealth}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${rightHealth}%`, backgroundColor: getColorFromName(rightFighter.color) }}
              />
            </div>
          </div>
        </div>

        {/* Boxers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-2xl h-64">
            {/* Left fighter */}
            <motion.div
              className="absolute left-0 bottom-0 w-40 h-64"
              animate={getBoxerAnimation(leftAnimationState, false)}
              style={{
                filter: winner === rightFighter.name ? "grayscale(1)" : "none",
                opacity: winner === rightFighter.name ? 0.7 : 1,
              }}
            >
              {renderFighter(leftFighter, true, leftAnimationState, leftPerformance)}

              <div
                className="absolute -top-6 left-0 right-0 text-center font-bold"
                style={{ color: getColorFromName(leftFighter.color) }}
              >
                {leftFighter.symbol}
                {leftPerformance?.isPositive ? (
                  <span className="ml-1 text-green-400">↑</span>
                ) : (
                  <span className="ml-1 text-red-400">↓</span>
                )}
              </div>

              {/* Impact effect */}
              {renderImpactEffect(rightAction, false)}
            </motion.div>

            {/* Right fighter */}
            <motion.div
              className="absolute right-0 bottom-0 w-40 h-64"
              animate={getBoxerAnimation(rightAnimationState, true)}
              style={{
                filter: winner === leftFighter.name ? "grayscale(1)" : "none",
                opacity: winner === leftFighter.name ? 0.7 : 1,
              }}
            >
              {renderFighter(rightFighter, false, rightAnimationState, rightPerformance)}

              <div
                className="absolute -top-6 left-0 right-0 text-center font-bold"
                style={{ color: getColorFromName(rightFighter.color) }}
              >
                {rightFighter.symbol}
                {rightPerformance?.isPositive ? (
                  <span className="ml-1 text-green-400">↑</span>
                ) : (
                  <span className="ml-1 text-red-400">↓</span>
                )}
              </div>

              {/* Impact effect */}
              {renderImpactEffect(leftAction, true)}
            </motion.div>
          </div>
        </div>

        {/* Winner announcement */}
        {winner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center p-8 bg-gray-900 rounded-xl border-2 border-yellow-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-2">{winner === "Draw" ? "Draw!" : `${winner} Wins!`}</h2>
              <p className="text-gray-400 mb-4">
                {winner === "Draw"
                  ? "Both cryptocurrencies performed equally well!"
                  : `${winner} outperformed in this round!`}
              </p>
              <p className="text-sm text-gray-500">
                Next match starts in {Math.floor((60 - roundTime) / 60)}:
                {((60 - roundTime) % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        )}

        {/* Action indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
          <div className="bg-gray-900 bg-opacity-80 px-3 py-1 rounded-full text-sm">
            {leftFighter.name}:{" "}
            <span className="font-bold capitalize" style={{ color: getColorFromName(leftFighter.color) }}>
              {leftAction}
            </span>
          </div>
          <div className="bg-gray-900 bg-opacity-80 px-3 py-1 rounded-full text-sm">
            {rightFighter.name}:{" "}
            <span className="font-bold capitalize" style={{ color: getColorFromName(rightFighter.color) }}>
              {rightAction}
            </span>
          </div>
        </div>

        {/* User controls */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-sm mb-1 text-center" style={{ color: getColorFromName(leftFighter.color) }}>
              {leftFighter.name} Controls
            </div>
            <div className="flex gap-2 mb-2">
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("jab", "left")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(leftFighter.color), borderWidth: "1px" }}
                >
                  1: Jab
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Quick Jab (consistent damage)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("hook", "left")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(leftFighter.color), borderWidth: "1px" }}
                >
                  2: Hook
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Strong Hook (risk/reward damage)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("uppercut", "left")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(leftFighter.color), borderWidth: "1px" }}
                >
                  3: Uppercut
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Uppercut (high damage but predictable)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("dodge", "left")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(leftFighter.color), borderWidth: "1px" }}
                >
                  4: Dodge
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Dodge (protect against next attack)
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm mb-1 text-center" style={{ color: getColorFromName(rightFighter.color) }}>
              {rightFighter.name} Controls
            </div>
            <div className="flex gap-2 mb-2">
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("jab", "right")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(rightFighter.color), borderWidth: "1px" }}
                >
                  1: Jab
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Quick Jab (consistent damage)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("hook", "right")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(rightFighter.color), borderWidth: "1px" }}
                >
                  2: Hook
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Strong Hook (risk/reward damage)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("uppercut", "right")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(rightFighter.color), borderWidth: "1px" }}
                >
                  3: Uppercut
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Uppercut (high damage but predictable)
                </div>
              </div>
              <div className="group relative">
                <button
                  onClick={() => handleUserAction("dodge", "right")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-900 bg-opacity-80 hover:bg-opacity-100"
                  style={{ borderColor: getColorFromName(rightFighter.color), borderWidth: "1px" }}
                >
                  4: Dodge
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Dodge (protect against next attack)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the appropriate fighter character based on the fighter id
  const renderFighter = (fighter: any, isLeft: boolean, action: string, performance: any) => {
    const fighterColor = getColorFromName(fighter.color)

    // Determine which character to render based on the fighter's icon
    if (fighter.icon === "🐂") {
      return renderBull(isLeft, action, performance, fighterColor)
    } else if (fighter.icon === "🐻") {
      return renderBear(isLeft, action, performance, fighterColor)
    } else if (fighter.icon === "🦊") {
      return renderFox(isLeft, action, performance, fighterColor)
    } else if (fighter.icon === "🐕") {
      return renderDog(isLeft, action, performance, fighterColor)
    } else {
      return renderGenericFighter(isLeft, action, performance, fighterColor, fighter.icon)
    }
  }

  // Render bull character
  const renderBull = (isLeft: boolean, action: string, performance: any, color: string) => {
    return (
      <div className="relative w-full h-full">
        {/* Bull Character */}
        <div className="absolute inset-0 bg-opacity-20 rounded-full blur-xl" style={{ backgroundColor: color }}></div>

        {/* Bull Body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-3xl"
          style={{ background: `linear-gradient(to top, ${color}33, ${color}99)` }}
        ></div>

        {/* Bull Head */}
        <div
          className="absolute top-1/6 left-1/2 -translate-x-1/2 w-24 h-20 rounded-t-3xl"
          style={{ backgroundColor: `${color}CC` }}
        >
          {/* Bull Eyes */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>

          {/* Bull Nose */}
          <div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-6 h-4 rounded-full"
            style={{ backgroundColor: `${color}EE` }}
          >
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-black rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-black rounded-full" />
          </div>

          {/* Bull Horns */}
          <div className="absolute -top-2 -left-4 w-8 h-3 bg-gray-300 rounded-full transform -rotate-12" />
          <div className="absolute -top-2 -right-4 w-8 h-3 bg-gray-300 rounded-full transform rotate-12" />
        </div>

        {/* Bull Arms */}
        <div className="absolute top-1/3 -left-2 w-6 h-16 rounded-full" style={{ backgroundColor: `${color}CC` }}></div>
        <div
          className="absolute top-1/3 -right-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: `${color}CC` }}
        ></div>

        {/* Bull Legs */}
        <div className="absolute bottom-0 left-2 w-8 h-20 rounded-b-xl" style={{ backgroundColor: `${color}44` }}></div>
        <div
          className="absolute bottom-0 right-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: `${color}44` }}
        ></div>

        {/* Boxing gloves */}
        <motion.div
          className="absolute top-1/2 -left-6 w-10 h-10 bg-red-600 rounded-full border-2 border-red-800"
          animate={
            action === "punch" || action === "uppercut" ? { x: 30, y: action === "uppercut" ? -20 : 0 } : { x: 0, y: 0 }
          }
          transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
        />
        <motion.div
          className="absolute top-1/2 -right-6 w-10 h-10 bg-red-600 rounded-full border-2 border-red-800"
          animate={action === "jab" ? { x: -30 } : { x: 0 }}
          transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
        />
      </div>
    )
  }

  // Render bear character
  const renderBear = (isLeft: boolean, action: string, performance: any, color: string) => {
    // Check if in Fury Mode
    const isFuryMode = performance?.isFuryMode

    return (
      <div className="relative w-full h-full">
        {/* Bear Character */}
        <div
          className="absolute inset-0 bg-opacity-20 rounded-full blur-xl"
          style={{ backgroundColor: isFuryMode ? "#FF0000" : color }}
        ></div>

        {/* Fury Mode effects */}
        {isFuryMode && (
          <>
            <div className="absolute inset-0 animate-pulse bg-red-500 opacity-10 rounded-full"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              FURY MODE
            </div>
          </>
        )}

        {/* Bear Body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-3xl"
          style={{
            background: isFuryMode
              ? `linear-gradient(to top, #FF000033, #FF0000AA)`
              : `linear-gradient(to top, ${color}33, ${color}99)`,
          }}
        ></div>

        {/* Bear Head */}
        <div
          className="absolute top-1/6 left-1/2 -translate-x-1/2 w-28 h-22 rounded-t-3xl"
          style={{ backgroundColor: isFuryMode ? "#FF0000CC" : `${color}CC` }}
        >
          {/* Bear Ears */}
          <div
            className="absolute -top-3 -left-2 w-8 h-8 rounded-full"
            style={{ backgroundColor: isFuryMode ? "#FF0000CC" : `${color}CC` }}
          ></div>
          <div
            className="absolute -top-3 -right-2 w-8 h-8 rounded-full"
            style={{ backgroundColor: isFuryMode ? "#FF0000CC" : `${color}CC` }}
          ></div>

          {/* Bear Eyes */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>

          {/* Bear Snout */}
          <div
            className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-10 h-6 rounded-full"
            style={{ backgroundColor: isFuryMode ? "#FF0000EE" : `${color}EE` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-2 bg-black rounded-full" />
          </div>
        </div>

        {/* Bear Arms */}
        <div
          className="absolute top-1/3 -left-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: isFuryMode ? "#FF0000CC" : `${color}CC` }}
        ></div>
        <div
          className="absolute top-1/3 -right-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: isFuryMode ? "#FF0000CC" : `${color}CC` }}
        ></div>

        {/* Bear Legs */}
        <div
          className="absolute bottom-0 left-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: isFuryMode ? "#FF000044" : `${color}44` }}
        ></div>
        <div
          className="absolute bottom-0 right-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: isFuryMode ? "#FF000044" : `${color}44` }}
        ></div>

        {/* Boxing gloves */}
        <motion.div
          className={`absolute top-1/2 -left-6 w-10 h-10 rounded-full border-2 ${isFuryMode ? "bg-red-600 border-red-800" : "bg-blue-600 border-blue-800"}`}
          animate={
            action === "punch" || action === "uppercut" ? { x: 30, y: action === "uppercut" ? -20 : 0 } : { x: 0, y: 0 }
          }
          transition={{ duration: isFuryMode ? 0.2 : 0.3, yoyo: 1, repeat: 1 }}
        />
        <motion.div
          className={`absolute top-1/2 -right-6 w-10 h-10 rounded-full border-2 ${isFuryMode ? "bg-red-600 border-red-800" : "bg-blue-600 border-blue-800"}`}
          animate={action === "jab" ? { x: -30 } : { x: 0 }}
          transition={{ duration: isFuryMode ? 0.2 : 0.3, yoyo: 1, repeat: 1 }}
        />
      </div>
    )
  }

  // Render fox character
  const renderFox = (isLeft: boolean, action: string, performance: any, color: string) => {
    return (
      <div className="relative w-full h-full">
        {/* Fox Character */}
        <div className="absolute inset-0 bg-opacity-20 rounded-full blur-xl" style={{ backgroundColor: color }}></div>

        {/* Fox Body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-3xl"
          style={{ background: `linear-gradient(to top, ${color}33, ${color}99)` }}
        ></div>

        {/* Fox Head */}
        <div
          className="absolute top-1/6 left-1/2 -translate-x-1/2 w-24 h-20 rounded-t-3xl"
          style={{ backgroundColor: `${color}CC` }}
        >
          {/* Fox Ears */}
          <div
            className="absolute -top-6 -left-2 w-6 h-10 rounded-t-full transform -rotate-6"
            style={{ backgroundColor: `${color}CC` }}
          ></div>
          <div
            className="absolute -top-6 -right-2 w-6 h-10 rounded-t-full transform rotate-6"
            style={{ backgroundColor: `${color}CC` }}
          ></div>

          {/* Fox Eyes */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>

          {/* Fox Snout */}
          <div
            className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-8 h-5 rounded-full"
            style={{ backgroundColor: `${color}EE` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black rounded-full" />
          </div>
        </div>

        {/* Fox Arms */}
        <div className="absolute top-1/3 -left-2 w-6 h-16 rounded-full" style={{ backgroundColor: `${color}CC` }}></div>
        <div
          className="absolute top-1/3 -right-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: `${color}CC` }}
        ></div>

        {/* Fox Legs */}
        <div className="absolute bottom-0 left-2 w-8 h-20 rounded-b-xl" style={{ backgroundColor: `${color}44` }}></div>
        <div
          className="absolute bottom-0 right-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: `${color}44` }}
        ></div>

        {/* Boxing gloves */}
        <motion.div
          className="absolute top-1/2 -left-6 w-10 h-10 bg-purple-600 rounded-full border-2 border-purple-800"
          animate={
            action === "punch" || action === "uppercut" ? { x: 30, y: action === "uppercut" ? -20 : 0 } : { x: 0, y: 0 }
          }
          transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
        />
        <motion.div
          className="absolute top-1/2 -right-6 w-10 h-10 bg-purple-600 rounded-full border-2 border-purple-800"
          animate={action === "jab" ? { x: -30 } : { x: 0 }}
          transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
        />
      </div>
    )
  }

  // Render dog character
  const renderDog = (isLeft: boolean, action: string, performance: any, color: string) => {
    return (
      <div className="relative w-full h-full">
        {/* Dog Character */}
        <div className="absolute inset-0 bg-opacity-20 rounded-full blur-xl" style={{ backgroundColor: color }}></div>

        {/* Dog Body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-3xl"
          style={{ background: `linear-gradient(to top, ${color}33, ${color}99)` }}
        ></div>

        {/* Dog Head */}
        <div
          className="absolute top-1/6 left-1/2 -translate-x-1/2 w-26 h-22 rounded-t-3xl"
          style={{ backgroundColor: `${color}CC` }}
        >
          {/* Dog Ears */}
          <div
            className="absolute -top-4 -left-4 w-10 h-8 rounded-full transform -rotate-12"
            style={{ backgroundColor: `${color}CC` }}
          ></div>
          <div
            className="absolute -top-4 -right-4 w-10 h-8 rounded-full transform rotate-12"
            style={{ backgroundColor: `${color}CC` }}
          ></div>

          {/* Dog Eyes */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-black rounded-full" />
          </div>

          {/* Dog Snout */}
          <div
            className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-12 h-7 rounded-full"
            style={{ backgroundColor: `${color}EE` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-5 h-2 bg-black rounded-full" />
          </div>
        </div>

        {/* Dog Arms */}
        <div className="absolute top-1/3 -left-2 w-6 h-16 rounded-full" style={{ backgroundColor: `${color}CC` }}></div>
        <div
          className="absolute top-1/3 -right-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: `${color}CC` }}
        ></div>

        {/* Dog Legs */}
        <div className="absolute bottom-0 left-2 w-8 h-20 rounded-b-xl" style={{ backgroundColor: `${color}44` }}></div>
        <div
          className="absolute bottom-0 right-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: `${color}44` }}
        ></div>

        {/* Boxing gloves */}
        <motion.div
          className="absolute top-1/2 -left-6 w-10 h-10 bg-yellow-600 rounded-full border-2 border-yellow-800"
          animate={
            action === "punch" || action === "uppercut" ? { x: 30, y: action === "uppercut" ? -20 : 0 } : { x: 0, y: 0 }
          }
          transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
        />
        <motion.div
          className="absolute top-1/2 -right-6 w-10 h-10 bg-yellow-600 rounded-full border-2 border-yellow-800"
          animate={action === "jab" ? { x: -30 } : { x: 0 }}
          transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
        />
      </div>
    )
  }

  // Render generic fighter
  const renderGenericFighter = (isLeft: boolean, action: string, performance: any, color: string, icon: string) => {
    return (
      <div className="relative w-full h-full">
        {/* Generic Character */}
        <div className="absolute inset-0 bg-opacity-20 rounded-full blur-xl" style={{ backgroundColor: color }}></div>

        {/* Generic Body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-3xl"
          style={{ background: `linear-gradient(to top, ${color}33, ${color}99)` }}
        ></div>

        {/* Generic Head */}
        <div
          className="absolute top-1/6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${color}CC` }}
        >
          {icon}
        </div>

        {/* Generic Arms */}
        <div className="absolute top-1/3 -left-2 w-6 h-16 rounded-full" style={{ backgroundColor: `${color}CC` }}></div>
        <div
          className="absolute top-1/3 -right-2 w-6 h-16 rounded-full"
          style={{ backgroundColor: `${color}CC` }}
        ></div>

        {/* Generic Legs */}
        <div className="absolute bottom-0 left-2 w-8 h-20 rounded-b-xl" style={{ backgroundColor: `${color}44` }}></div>
        <div
          className="absolute bottom-0 right-2 w-8 h-20 rounded-b-xl"
          style={{ backgroundColor: `${color}44` }}
        ></div>

        {/* Boxing gloves */}
        <motion.div
          className="absolute top-1/2 -left-6 w-10 h-10 rounded-full border-2"
          style={{ backgroundColor: `${color}99`, borderColor: `${color}EE` }}
          animate={
            action === "punch" || action === "uppercut" ? { x: 30, y: action === "uppercut" ? -20 : 0 } : { x: 0, y: 0 }
          }
          transition={{ duration: 0.3, yoyo: 1, repeat: 1 }}
        />
        <motion.div
          className="absolute top-1/2 -right-6 w-10 h-10 rounded-full border-2"
          style={{ backgroundColor: `${color}99`, borderColor: `${color}EE` }}
          animate={action === "jab" ? { x: -30 } : { x: 0 }}
          transition={{ duration: 0.2, yoyo: 1, repeat: 1 }}
        />
      </div>
    )
  }

  return renderBoxingRing()
}
