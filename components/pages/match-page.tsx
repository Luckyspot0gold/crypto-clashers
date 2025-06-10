"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BoxingRing from "@/components/boxing-ring"
import BattleLog from "@/components/battle-log"
import ArenaEffects from "@/components/arena-effects"
import SoundControls from "@/components/sound-controls"
import { fetchCryptoData } from "@/lib/crypto-api"
import type { CandlestickData } from "@/lib/types"
import { marketMeleeFormula } from "@/lib/market-melee-formula"
import soundManager from "@/lib/sound-manager"
import Image from "next/image"

interface MatchPageProps {
  leftFighter: any
  rightFighter: any
  betAmount: number
  betOn: string | null
  onMatchComplete: (winner: string | null, betWon: boolean, winAmount?: number) => void
}

export default function MatchPage({ leftFighter, rightFighter, betAmount, betOn, onMatchComplete }: MatchPageProps) {
  const [fighterData, setFighterData] = useState<Record<string, CandlestickData[]>>({})
  const [loading, setLoading] = useState(true)
  const [gameSpeed, setGameSpeed] = useState(1) // 1x speed by default
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isMatchActive, setIsMatchActive] = useState(false)
  const [matchRound, setMatchRound] = useState(1) // Start at Round 1 instead of 0
  const [winner, setWinner] = useState<string | null>(null)
  const [cameraAngle, setCameraAngle] = useState<"side" | "forward">("side")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.8) // Default volume at 80%
  const [matchStarted, setMatchStarted] = useState(false)
  const [roundDuration, setRoundDuration] = useState(60 * 60) // 60 minutes in seconds
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(60 * 60)
  const [leftPoints, setLeftPoints] = useState(0)
  const [rightPoints, setRightPoints] = useState(0)
  const [totalRounds, setTotalRounds] = useState(8) // 8 rounds as requested
  const [showVictoryScreen, setShowVictoryScreen] = useState(false)

  // Audio refs
  const themeAudioRef = useRef<HTMLAudioElement | null>(null)
  const crowdAudioRef = useRef<HTMLAudioElement | null>(null)

  // User controls
  const [userControls, setUserControls] = useState({
    leftPower: 0,
    rightPower: 0,
    leftCombo: 0,
    rightCombo: 0,
    leftLastMove: "",
    rightLastMove: "",
    leftSpecialCharged: false,
    rightSpecialCharged: false,
  })

  // Initialize sound system
  useEffect(() => {
    soundManager
      .loadSounds()
      .then(() => {
        console.log("Sounds loaded for match page")
      })
      .catch((err) => {
        console.warn("Failed to load sounds for match page:", err)
      })

    return () => {
      // Clean up sounds when component unmounts
      if (themeAudioRef.current) {
        try {
          soundManager.stop(themeAudioRef.current)
        } catch (err) {
          console.warn("Error stopping theme music:", err)
        }
      }
      if (crowdAudioRef.current) {
        try {
          soundManager.stop(crowdAudioRef.current)
        } catch (err) {
          console.warn("Error stopping crowd sound:", err)
        }
      }
    }
  }, [])

  // Update sound volume
  useEffect(() => {
    soundManager.setVolume(volume)
  }, [volume])

  // Toggle sound
  const toggleSound = () => {
    const newSoundState = !soundEnabled
    setSoundEnabled(newSoundState)
    soundManager.muted = !newSoundState

    if (!newSoundState) {
      if (themeAudioRef.current) {
        soundManager.stop(themeAudioRef.current)
        themeAudioRef.current = null
      }
      if (crowdAudioRef.current) {
        soundManager.stop(crowdAudioRef.current)
        crowdAudioRef.current = null
      }
    } else if (matchStarted) {
      crowdAudioRef.current = soundManager.play("fight", true)
    }
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  // Fetch data for fighters
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        // Create an object to store all fighter data
        const allData: Record<string, CandlestickData[]> = {}

        // Fetch data for both fighters
        const leftData = await fetchCryptoData(leftFighter.id)
        const rightData = await fetchCryptoData(rightFighter.id)

        allData[leftFighter.id] = leftData
        allData[rightFighter.id] = rightData

        setFighterData(allData)
      } catch (error) {
        console.error("Error fetching crypto data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [leftFighter.id, rightFighter.id])

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

  // Determine boxing actions based on market data
  const leftAction = leftPerformance?.action || "idle"
  const rightAction = rightPerformance?.action || "idle"

  // Start the match
  const startMatch = () => {
    if (isMatchActive) return

    setMatchStarted(true)
    setIsMatchActive(true)
    setMatchRound(1)
    // Set a shorter round duration for testing/demo purposes
    // In a real app with real market data, you'd use the full 60 minutes
    const demoRoundDuration = 60 // 60 seconds per round for demo
    setRoundDuration(demoRoundDuration)
    setRoundTimeRemaining(demoRoundDuration)
    setWinner(null)
    setLeftPoints(0)
    setRightPoints(0)
    setShowVictoryScreen(false)

    setBattleLog([
      `<strong>🥊 New match starting: ${leftFighter.name} ${leftFighter.icon} vs ${rightFighter.name} ${rightFighter.icon}! 🥊</strong>`,
      `<span class="text-blue-400">Each round lasts ${demoRoundDuration} seconds in demo mode.</span>`,
      `<span class="text-yellow-400">This is a ${totalRounds}-round match. The fighter with the most points at the end wins!</span>`,
    ])

    // Play bell sound with error handling
    try {
      soundManager.play("bell")
    } catch (err) {
      console.warn("Could not play bell sound:", err)
    }

    // Start crowd noise with error handling
    if (soundEnabled) {
      try {
        crowdAudioRef.current = soundManager.play("fight", true)
      } catch (err) {
        console.warn("Could not play crowd noise:", err)
      }
    }

    if (betOn) {
      setBattleLog((prev) => [
        ...prev,
        `<span class="text-yellow-400">💰 You bet ${betAmount} STYRD on ${betOn}! 💰</span>`,
        `<span class="text-gray-400">House edge: 5% - Payout on win: 1.9x</span>`,
      ])
    }
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle match simulation
  useEffect(() => {
    if (!leftPerformance || !rightPerformance || !isMatchActive) return

    // Update round timer
    const timerInterval = setInterval(() => {
      setRoundTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval)

          // Award points based on performance
          let leftRoundPoints = 0
          let rightRoundPoints = 0

          // Calculate points based on percent change and other factors
          const leftChange = leftPerformance.percentChange
          const rightChange = rightPerformance.percentChange

          // Award points based on price change
          if (leftChange > rightChange) {
            leftRoundPoints += 10
            setBattleLog((prev) => [
              ...prev,
              `${leftFighter.name} wins round ${matchRound} with better price performance! +10 points`,
            ])
          } else if (rightChange > leftChange) {
            rightRoundPoints += 10
            setBattleLog((prev) => [
              ...prev,
              `${rightFighter.name} wins round ${matchRound} with better price performance! +10 points`,
            ])
          } else {
            // Tie
            leftRoundPoints += 5
            rightRoundPoints += 5
            setBattleLog((prev) => [...prev, `Round ${matchRound} ends in a tie! Both fighters get +5 points`])
          }

          // Award bonus points for volatility
          if (leftPerformance.volatility > rightPerformance.volatility) {
            leftRoundPoints += 2
            setBattleLog((prev) => [...prev, `${leftFighter.name} shows higher volatility! +2 bonus points`])
          } else if (rightPerformance.volatility > leftPerformance.volatility) {
            rightRoundPoints += 2
            setBattleLog((prev) => [...prev, `${rightFighter.name} shows higher volatility! +2 bonus points`])
          }

          // Award bonus points for volume
          if (leftPerformance.volume > rightPerformance.volume) {
            leftRoundPoints += 3
            setBattleLog((prev) => [...prev, `${leftFighter.name} has higher trading volume! +3 bonus points`])
          } else if (rightPerformance.volume > leftPerformance.volume) {
            rightRoundPoints += 3
            setBattleLog((prev) => [...prev, `${rightFighter.name} has higher trading volume! +3 bonus points`])
          }

          // Update total points
          const newLeftPoints = leftPoints + leftRoundPoints
          const newRightPoints = rightPoints + rightRoundPoints

          setLeftPoints(newLeftPoints)
          setRightPoints(newRightPoints)

          setBattleLog((prev) => [
            ...prev,
            `<strong>Round ${matchRound} Score: ${leftFighter.name} +${leftRoundPoints} | ${rightFighter.name} +${rightRoundPoints}</strong>`,
            `<strong>Total Score: ${leftFighter.name} ${newLeftPoints} | ${rightFighter.name} ${newRightPoints}</strong>`,
          ])

          // Move to next round or end match
          if (matchRound < totalRounds) {
            setMatchRound((prev) => prev + 1)
            setRoundTimeRemaining(roundDuration)

            // Add round announcement to battle log
            setBattleLog((prev) => [...prev, `<strong>🔔 Round ${matchRound + 1} begins!</strong>`])

            // Play bell sound
            soundManager.play("bell")

            // Add action logs
            if (leftAction !== "idle") {
              setBattleLog((prev) => [
                ...prev,
                `${leftFighter.icon} ${leftFighter.name} uses <strong>${leftAction}</strong>!`,
              ])

              // Play sound for action
              soundManager.play(leftAction === "jab" ? "button" : "coin")
            }

            if (rightAction !== "idle") {
              setBattleLog((prev) => [
                ...prev,
                `${rightFighter.icon} ${rightFighter.name} uses <strong>${rightAction}</strong>!`,
              ])

              // Play sound for action
              soundManager.play(rightAction === "jab" ? "button" : "coin")
            }

            // Add market movement logs
            if (leftPerformance.percentChange > 0) {
              setBattleLog((prev) => [
                ...prev,
                `📈 ${leftFighter.name} price moved <span class="text-green-400">+${leftPerformance.percentChange.toFixed(2)}%</span>`,
              ])
            } else {
              setBattleLog((prev) => [
                ...prev,
                `📉 ${leftFighter.name} price moved <span class="text-red-400">${leftPerformance.percentChange.toFixed(2)}%</span>`,
              ])
            }

            if (rightPerformance.percentChange > 0) {
              setBattleLog((prev) => [
                ...prev,
                `📈 ${rightFighter.name} price moved <span class="text-green-400">+${rightPerformance.percentChange.toFixed(2)}%</span>`,
              ])
            } else {
              setBattleLog((prev) => [
                ...prev,
                `📉 ${rightFighter.name} price moved <span class="text-red-400">${rightPerformance.percentChange.toFixed(2)}%</span>`,
              ])
            }

            // Check for Solana Fury Mode
            if (rightFighter.id === "solana" && rightPerformance.isFuryMode) {
              setBattleLog((prev) => [
                ...prev,
                `<span class="text-red-500">⚡⚡ ${rightFighter.name} ${rightFighter.icon} ENTERS FURY MODE! Price below $150! ⚡⚡</span>`,
              ])
            }

            // Also check for left fighter
            if (leftFighter.id === "solana" && leftPerformance.isFuryMode) {
              setBattleLog((prev) => [
                ...prev,
                `<span class="text-red-500">⚡⚡ ${leftFighter.name} ${leftFighter.icon} ENTERS FURY MODE! Price below $150! ⚡⚡</span>`,
              ])
            }
          } else {
            // End the match
            setIsMatchActive(false)

            // Determine winner based on points
            const finalLeftPoints = newLeftPoints
            const finalRightPoints = newRightPoints
            let matchWinner: string | null = null
            let betWon = false
            let winAmount = 0

            if (finalLeftPoints > finalRightPoints) {
              matchWinner = leftFighter.name
              setWinner(leftFighter.name)
              setBattleLog((prev) => [
                ...prev,
                `<strong>🏆 ${leftFighter.name} ${leftFighter.icon} WINS THE MATCH WITH ${finalLeftPoints} POINTS! 🏆</strong>`,
              ])

              // Play victory sound
              soundManager.play("victory")

              // Stop crowd noise and play theme
              if (crowdAudioRef.current) {
                soundManager.stop(crowdAudioRef.current)
              }
              themeAudioRef.current = soundManager.play("theme", true)

              // Check if bet won
              if (betOn === leftFighter.name) {
                betWon = true
                // Payout is 1.9x instead of 2x (house edge)
                winAmount = Math.floor(betAmount * 1.9)
                setBattleLog((prev) => [
                  ...prev,
                  `<span class="text-green-400">💰 You won ${winAmount} STYRD tokens! 💰</span>`,
                ])
                soundManager.play("coin")
              } else if (betOn === rightFighter.name) {
                setBattleLog((prev) => [
                  ...prev,
                  `<span class="text-red-400">❌ You lost your bet of ${betAmount} STYRD tokens.</span>`,
                ])
                soundManager.play("defeat")
              }
            } else if (finalRightPoints > finalLeftPoints) {
              matchWinner = rightFighter.name
              setWinner(rightFighter.name)
              setBattleLog((prev) => [
                ...prev,
                `<strong>🏆 ${rightFighter.name} ${rightFighter.icon} WINS THE MATCH WITH ${finalRightPoints} POINTS! 🏆</strong>`,
              ])

              // Play victory sound
              soundManager.play("victory")

              // Stop crowd noise and play theme
              if (crowdAudioRef.current) {
                soundManager.stop(crowdAudioRef.current)
              }
              themeAudioRef.current = soundManager.play("theme", true)

              // Check if bet won
              if (betOn === rightFighter.name) {
                betWon = true
                // Payout is 1.9x instead of 2x (house edge)
                winAmount = Math.floor(betAmount * 1.9)
                setBattleLog((prev) => [
                  ...prev,
                  `<span class="text-green-400">💰 You won ${winAmount} STYRD tokens! 💰</span>`,
                ])
                soundManager.play("coin")
              } else if (betOn === leftFighter.name) {
                setBattleLog((prev) => [
                  ...prev,
                  `<span class="text-red-400">❌ You lost your bet of ${betAmount} STYRD tokens.</span>`,
                ])
                soundManager.play("defeat")
              }
            } else {
              matchWinner = "DRAW"
              setWinner("DRAW")
              setBattleLog((prev) => [
                ...prev,
                `<strong>⚖️ THE MATCH ENDS IN A DRAW WITH ${finalLeftPoints} POINTS EACH! ⚖️</strong>`,
              ])

              // Stop crowd noise and play theme
              if (crowdAudioRef.current) {
                soundManager.stop(crowdAudioRef.current)
              }
              themeAudioRef.current = soundManager.play("theme", true)

              // Return bet amount if there's a draw
              if (betOn) {
                betWon = false
                winAmount = betAmount // Return original bet
                setBattleLog((prev) => [...prev, `Your bet of ${betAmount} STYRD tokens has been refunded.`])
              }
            }

            // Reset user controls
            setUserControls({
              leftPower: 0,
              rightPower: 0,
              leftCombo: 0,
              rightCombo: 0,
              leftLastMove: "",
              rightLastMove: "",
              leftSpecialCharged: false,
              rightSpecialCharged: false,
            })

            // Show victory screen for 5 seconds before returning to betting screen
            setShowVictoryScreen(true)

            // Notify parent component of match completion after victory screen
            setTimeout(() => {
              onMatchComplete(matchWinner, betWon, winAmount)
            }, 5000)
          }
        }
        return Math.max(0, prev - 1)
      })
    }, 1000 / gameSpeed)

    return () => clearInterval(timerInterval)
  }, [
    leftPerformance,
    rightPerformance,
    isMatchActive,
    matchRound,
    gameSpeed,
    leftAction,
    rightAction,
    betOn,
    betAmount,
    leftFighter,
    rightFighter,
    onMatchComplete,
    roundDuration,
    leftPoints,
    rightPoints,
    totalRounds,
    soundEnabled,
  ])

  // Handle user actions
  const handleUserAction = (action: string, fighter: "left" | "right") => {
    if (!isMatchActive) return

    // Play sound for action
    soundManager.play(action === "jab" ? "button" : "coin")

    // Calculate damage based on move type
    let baseDamage = 0
    let comboMultiplier = 1
    let moveDescription = ""

    switch (action) {
      case "jab":
        baseDamage = 8 + Math.floor(Math.random() * 5) // 8-12 damage
        moveDescription = "Quick Jab"
        break
      case "hook":
        baseDamage = 12 + Math.floor(Math.random() * 7) // 12-18 damage
        moveDescription = "Strong Hook"
        break
      case "uppercut":
        baseDamage = 15 + Math.floor(Math.random() * 11) // 15-25 damage
        moveDescription = "Powerful Uppercut"
        break
      case "dodge":
        baseDamage = 0
        moveDescription = "Defensive Dodge"
        break
      default:
        baseDamage = 5 + Math.floor(Math.random() * 6) // 5-10 damage
        moveDescription = action
    }

    if (fighter === "left") {
      // Check for combo
      if (userControls.leftLastMove === action && action !== "dodge") {
        const newCombo = userControls.leftCombo + 1
        comboMultiplier = 1 + newCombo * 0.2 // 20% damage increase per combo

        // Update controls
        setUserControls((prev) => ({
          ...prev,
          leftPower: Math.min(100, prev.leftPower + baseDamage),
          leftCombo: newCombo,
          leftLastMove: action,
          leftSpecialCharged: newCombo >= 3, // Special charged after 3 combos
        }))

        // Add combo message to battle log
        if (newCombo > 1) {
          setBattleLog((prev) => [
            ...prev,
            `<span class="text-yellow-400">🔥 ${newCombo}x COMBO! ${leftFighter.name}'s ${moveDescription} damage increased by ${Math.round((comboMultiplier - 1) * 100)}%!</span>`,
          ])
        }
      } else {
        // Reset combo
        setUserControls((prev) => ({
          ...prev,
          leftPower: Math.min(100, prev.leftPower + baseDamage),
          leftCombo: action !== "dodge" ? 1 : 0,
          leftLastMove: action,
        }))
      }

      // Add to battle log
      setBattleLog((prev) => [
        ...prev,
        `<span class="text-blue-400">👊 You used ${moveDescription} with ${leftFighter.name}${userControls.leftCombo > 1 ? ` (${userControls.leftCombo}x combo)` : ""}!</span>`,
      ])
    } else {
      // Check for combo
      if (userControls.rightLastMove === action && action !== "dodge") {
        const newCombo = userControls.rightCombo + 1
        comboMultiplier = 1 + newCombo * 0.2 // 20% damage increase per combo

        // Update controls
        setUserControls((prev) => ({
          ...prev,
          rightPower: Math.min(100, prev.rightPower + baseDamage),
          rightCombo: newCombo,
          rightLastMove: action,
          rightSpecialCharged: newCombo >= 3, // Special charged after 3 combos
        }))

        // Add combo message to battle log
        if (newCombo > 1) {
          setBattleLog((prev) => [
            ...prev,
            `<span class="text-yellow-400">🔥 ${newCombo}x COMBO! ${rightFighter.name}'s ${moveDescription} damage increased by ${Math.round((comboMultiplier - 1) * 100)}%!</span>`,
          ])
        }
      } else {
        // Reset combo
        setUserControls((prev) => ({
          ...prev,
          rightPower: Math.min(100, prev.rightPower + baseDamage),
          rightCombo: action !== "dodge" ? 1 : 0,
          rightLastMove: action,
        }))
      }

      // Add to battle log
      setBattleLog((prev) => [
        ...prev,
        `<span class="text-purple-400">👊 You used ${moveDescription} with ${rightFighter.name}${userControls.rightCombo > 1 ? ` (${userControls.rightCombo}x combo)` : ""}!</span>`,
      ])
    }

    // Special move charged notification
    if (
      (fighter === "left" && userControls.leftSpecialCharged) ||
      (fighter === "right" && userControls.rightSpecialCharged)
    ) {
      setBattleLog((prev) => [
        ...prev,
        `<span class="text-green-400">⚡ SPECIAL MOVE CHARGED! Next uppercut will deal critical damage!</span>`,
      ])
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500">
            Crypto Clashers™ - Live Match
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Game Speed:</span>
              <select
                value={gameSpeed}
                onChange={(e) => setGameSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
              </select>
            </div>

            <SoundControls
              soundEnabled={soundEnabled}
              volume={volume}
              onToggleSound={toggleSound}
              onVolumeChange={handleVolumeChange}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCameraAngle(cameraAngle === "side" ? "forward" : "side")}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              {cameraAngle === "side" ? "Forward View" : "Side View"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading match data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {!matchStarted ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    {leftFighter.name} {leftFighter.icon} vs {rightFighter.name} {rightFighter.icon}
                  </h2>
                  <p className="text-xl text-gray-300">The ultimate crypto boxing showdown is about to begin!</p>
                </div>

                <div className="relative w-full max-w-2xl mb-8">
                  <Image
                    src="/images/crypto-arena.webp"
                    alt="Boxing Arena"
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-xl"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex justify-center gap-16">
                      <div className="text-center">
                        <div className="text-8xl mb-4 drop-shadow-lg">{leftFighter.icon}</div>
                      </div>

                      <div className="flex items-center">
                        <div className="text-4xl font-bold text-red-500 drop-shadow-lg">VS</div>
                      </div>

                      <div className="text-center">
                        <div className="text-8xl mb-4 drop-shadow-lg">{rightFighter.icon}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-16 mb-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold" style={{ color: getColorFromName(leftFighter.color) }}>
                      {leftFighter.name}
                    </h3>
                    <p className="text-gray-400">{leftFighter.symbol}</p>
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold" style={{ color: getColorFromName(rightFighter.color) }}>
                      {rightFighter.name}
                    </h3>
                    <p className="text-gray-400">{rightFighter.symbol}</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-8 max-w-md">
                  <h3 className="text-lg font-bold text-center mb-2">Match Rules</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• This is an 8-round boxing match (8 hours total)</li>
                    <li>• Each round lasts 60 minutes</li>
                    <li>• Points are awarded based on market performance</li>
                    <li>• The fighter with the most points at the end wins</li>
                    <li>• Use the controls to influence the match</li>
                  </ul>
                </div>

                {betOn && (
                  <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-8 max-w-md">
                    <p className="text-center text-yellow-200">
                      You've bet <span className="font-bold">{betAmount} STYRD</span> on{" "}
                      <span className="font-bold">{betOn}</span>
                    </p>
                    <p className="text-center text-gray-400 text-sm mt-1">
                      Potential payout: {Math.floor(betAmount * 1.9)} STYRD (1.9x)
                    </p>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={() => {
                    startMatch()
                    soundManager.play("bell")
                  }}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  Start Match
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="relative">
                    <BoxingRing
                      leftFighter={leftFighter}
                      rightFighter={rightFighter}
                      leftAction={leftAction}
                      rightAction={rightAction}
                      leftPerformance={leftPerformance}
                      rightPerformance={rightPerformance}
                      gameSpeed={gameSpeed}
                      leftData={leftData}
                      rightData={rightData}
                      userControls={userControls}
                      onUserAction={handleUserAction}
                      cameraAngle={cameraAngle}
                      betOn={betOn}
                    />

                    <ArenaEffects
                      isMatchActive={isMatchActive}
                      matchRound={matchRound}
                      winner={winner}
                      leftFighter={leftFighter.name}
                      rightFighter={rightFighter.name}
                    />
                  </div>

                  <BattleLog logs={battleLog} />
                </div>

                <div className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800 p-4">
                    <h3 className="text-lg font-bold mb-4">Match Controls</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2" style={{ color: getColorFromName(leftFighter.color) }}>
                          {leftFighter.name} Controls
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleUserAction("jab", "left")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            1: Jab
                          </Button>
                          <Button
                            onClick={() => handleUserAction("hook", "left")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            2: Hook
                          </Button>
                          <Button
                            onClick={() => handleUserAction("uppercut", "left")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            3: Uppercut
                          </Button>
                          <Button
                            onClick={() => handleUserAction("dodge", "left")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            4: Dodge
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4
                          className="text-sm font-medium mb-2"
                          style={{ color: getColorFromName(rightFighter.color) }}
                        >
                          {rightFighter.name} Controls
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleUserAction("jab", "right")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            1: Jab
                          </Button>
                          <Button
                            onClick={() => handleUserAction("hook", "right")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            2: Hook
                          </Button>
                          <Button
                            onClick={() => handleUserAction("uppercut", "right")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            3: Uppercut
                          </Button>
                          <Button
                            onClick={() => handleUserAction("dodge", "right")}
                            disabled={!isMatchActive}
                            className="bg-gray-800 hover:bg-gray-700"
                          >
                            4: Dodge
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Move Effects:</h4>
                      <ul className="text-xs space-y-1 text-gray-300">
                        <li>1: Quick Jab - Consistent damage</li>
                        <li>2: Strong Hook - Risk/reward damage</li>
                        <li>3: Uppercut - High damage but predictable</li>
                        <li>4: Dodge - Protect against next attack</li>
                      </ul>
                    </div>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 p-4">
                    <h3 className="text-lg font-bold mb-2">Match Info</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Round:</span>
                        <span className="font-bold">
                          {matchRound}/{totalRounds}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Round Time:</span>
                        <span className="font-bold">{formatTimeRemaining(roundTimeRemaining)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Match Status:</span>
                        <span className="font-bold">
                          {isMatchActive ? (
                            <span className="text-green-400">Active</span>
                          ) : (
                            <span className="text-red-400">Completed</span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Score:</span>
                        <span className="font-bold">
                          {leftPoints} - {rightPoints}
                        </span>
                      </div>

                      {betOn && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Your Bet:</span>
                          <span className="font-bold text-yellow-400">
                            {betAmount} STYRD on {betOn}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-400">Camera Angle:</span>
                        <span className="font-bold">{cameraAngle === "side" ? "Side View" : "Forward View"}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
        {showVictoryScreen && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="text-center p-8 bg-gray-900 rounded-xl border-2 border-yellow-500 max-w-2xl">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-4xl font-bold mb-4 text-yellow-400">
                {winner === "DRAW" ? "It's a Draw!" : `${winner} Wins!`}
              </h2>

              <div className="my-6 relative h-64">
                {/* Pixel animation placeholder - replace with your actual animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <Image
                      src="/images/pixel-boxer.gif"
                      alt="Victory Animation"
                      width={192}
                      height={192}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xl mb-6">
                {winner === "DRAW"
                  ? "Both fighters showed equal strength!"
                  : winner === leftFighter.name
                    ? `${leftFighter.name} ${leftFighter.icon} defeated ${rightFighter.name} ${rightFighter.icon}!`
                    : `${rightFighter.name} ${rightFighter.icon} defeated ${leftFighter.name} ${leftFighter.icon}!`}
              </p>

              {betOn && (
                <div className="mb-6 p-4 rounded-lg bg-gray-800">
                  <h3 className="text-xl font-bold mb-2">Betting Results</h3>
                  {betOn === winner ? (
                    <p className="text-green-400">
                      You won {Math.floor(betAmount * 1.9)} STYRD by betting on {betOn}!
                    </p>
                  ) : winner === "DRAW" ? (
                    <p className="text-yellow-400">Your bet of {betAmount} STYRD has been refunded.</p>
                  ) : (
                    <p className="text-red-400">
                      You lost your bet of {betAmount} STYRD on {betOn}.
                    </p>
                  )}
                </div>
              )}

              <p className="text-gray-400 mb-4">Returning to betting screen in a few seconds...</p>
            </div>
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

// Helper function to get color from name
function getColorFromName(colorName: string): string {
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
