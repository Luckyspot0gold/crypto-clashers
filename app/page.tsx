"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/pages/login-page"
import StatsPage from "@/components/pages/stats-page"
import SelectBoxingCoin from "@/components/pages/select-boxing-coin"
import VerifyBetPage from "@/components/pages/verify-bet-page"
import MatchPage from "@/components/pages/match-page"
import { availableFighters } from "@/lib/crypto-api"
import soundManager from "@/lib/sound-manager"

export default function CryptoClashers() {
  // App state
  const [currentPage, setCurrentPage] = useState<"login" | "select" | "stats" | "verify" | "match">("login")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isAgeVerified, setIsAgeVerified] = useState(false)
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false)

  // Selected fighters
  const [leftFighter, setLeftFighter] = useState(availableFighters[0]) // Bitcoin by default
  const [rightFighter, setRightFighter] = useState(availableFighters[2]) // Solana by default

  // Betting state
  const [userAccount, setUserAccount] = useState({
    balance: 1000, // Starting balance of 1000 STYRD tokens
    betAmount: 0,
    betOn: null as string | null,
  })

  // User stats
  const [userStats, setUserStats] = useState({
    matchesPlayed: 0,
    matchesWon: 0,
    totalBets: 0,
    highestWin: 0,
  })

  // Initialize sound manager
  useEffect(() => {
    soundManager
      .loadSounds()
      .then(() => {
        console.log("Sounds loaded for main app")
      })
      .catch((err) => {
        console.warn("Failed to load sounds for main app:", err)
      })
  }, [])

  // Handle wallet connection
  const handleConnectWallet = () => {
    setIsWalletConnected(true)
    setWalletAddress("8xH4ck3rWa11et5o1AnAacc0unT9z")
    try {
      soundManager.play("button")
    } catch (err) {
      console.warn("Could not play button sound:", err)
    }
  }

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    setIsWalletConnected(false)
    setWalletAddress("")
    try {
      soundManager.play("button")
    } catch (err) {
      console.warn("Could not play button sound:", err)
    }
  }

  // Handle age verification
  const handleVerifyAge = () => {
    setIsAgeVerified(true)
  }

  // Handle accepting rules
  const handleAcceptRules = () => {
    setHasAcceptedRules(true)
  }

  // Handle fighter selection
  const handleSelectFighters = (left: any, right: any) => {
    setLeftFighter(left)
    setRightFighter(right)
    try {
      soundManager.play("button")
    } catch (err) {
      console.warn("Could not play button sound:", err)
    }
  }

  // Handle placing a bet
  const handlePlaceBet = (fighter: string, amount: number) => {
    if (amount > userAccount.balance) return

    setUserAccount({
      balance: userAccount.balance - amount,
      betAmount: amount,
      betOn: fighter,
    })

    // Update stats
    setUserStats((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
    }))

    // Move to verify page
    setCurrentPage("verify")
    try {
      soundManager.play("coin")
    } catch (err) {
      console.warn("Could not play coin sound:", err)
    }
  }

  // Handle match completion
  const handleMatchComplete = (winner: string | null, betWon: boolean, winAmount = 0) => {
    // Update user balance if they won
    if (betWon) {
      setUserAccount((acc) => ({
        ...acc,
        balance: acc.balance + winAmount,
        betAmount: 0,
        betOn: null,
      }))

      // Update stats
      setUserStats((prev) => ({
        ...prev,
        matchesWon: prev.matchesWon + 1,
        highestWin: Math.max(prev.highestWin, winAmount),
      }))
    } else {
      setUserAccount((acc) => ({
        ...acc,
        betAmount: 0,
        betOn: null,
      }))
    }

    // Update matches played
    setUserStats((prev) => ({
      ...prev,
      matchesPlayed: prev.matchesPlayed + 1,
    }))

    // Return to stats page
    setTimeout(() => {
      setCurrentPage("stats")
    }, 5000)
  }

  // Render the appropriate page based on current state
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {currentPage === "login" && (
        <LoginPage
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          isAgeVerified={isAgeVerified}
          hasAcceptedRules={hasAcceptedRules}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
          onVerifyAge={handleVerifyAge}
          onAcceptRules={handleAcceptRules}
          onContinue={() => {
            setCurrentPage("select")
            soundManager.play("button")
          }}
        />
      )}

      {currentPage === "select" && (
        <SelectBoxingCoin
          onSelectFighters={handleSelectFighters}
          onContinue={() => {
            setCurrentPage("stats")
            soundManager.play("button")
          }}
        />
      )}

      {currentPage === "stats" && (
        <StatsPage
          leftFighter={leftFighter}
          rightFighter={rightFighter}
          userBalance={userAccount.balance}
          userStats={userStats}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          onSelectFighters={handleSelectFighters}
          onPlaceBet={handlePlaceBet}
          onDisconnectWallet={handleDisconnectWallet}
          onStartDemo={() => {
            setCurrentPage("match")
            soundManager.play("button")
          }}
        />
      )}

      {currentPage === "verify" && (
        <VerifyBetPage
          leftFighter={leftFighter}
          rightFighter={rightFighter}
          betAmount={userAccount.betAmount}
          betOn={userAccount.betOn}
          onConfirm={() => {
            setCurrentPage("match")
            soundManager.play("button")
          }}
          onCancel={() => {
            // Return bet amount
            setUserAccount((prev) => ({
              ...prev,
              balance: prev.balance + prev.betAmount,
              betAmount: 0,
              betOn: null,
            }))
            setCurrentPage("stats")
            soundManager.play("button")
          }}
        />
      )}

      {currentPage === "match" && (
        <MatchPage
          leftFighter={leftFighter}
          rightFighter={rightFighter}
          betAmount={userAccount.betAmount}
          betOn={userAccount.betOn}
          onMatchComplete={handleMatchComplete}
        />
      )}
    </div>
  )
}

