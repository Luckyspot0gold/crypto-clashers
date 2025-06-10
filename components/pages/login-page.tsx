"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Wallet, Shield, Info, AlertTriangle, CheckCircle } from "lucide-react"
import WalletConnector from "@/components/wallet-connector"
import SoundControls from "@/components/sound-controls"
import Image from "next/image"
import soundManager from "@/lib/sound-manager"

interface LoginPageProps {
  isWalletConnected: boolean
  walletAddress: string
  isAgeVerified: boolean
  hasAcceptedRules: boolean
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  onVerifyAge: () => void
  onAcceptRules: () => void
  onContinue: () => void
}

export default function LoginPage({
  isWalletConnected,
  walletAddress,
  isAgeVerified,
  hasAcceptedRules,
  onConnectWallet,
  onDisconnectWallet,
  onVerifyAge,
  onAcceptRules,
  onContinue,
}: LoginPageProps) {
  const [showRules, setShowRules] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const themeAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize and play theme music
  useEffect(() => {
    // Load sounds when component mounts
    soundManager
      .loadSounds()
      .then(() => {
        // Try to play theme music, but handle errors gracefully
        try {
          themeAudioRef.current = soundManager.play("theme", true)
        } catch (err) {
          console.warn("Could not play theme music:", err)
        }
      })
      .catch((err) => {
        console.warn("Failed to load sounds:", err)
      })

    // Cleanup when component unmounts
    return () => {
      if (themeAudioRef.current) {
        try {
          soundManager.stop(themeAudioRef.current)
        } catch (err) {
          console.warn("Error stopping theme music:", err)
        }
      }
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    soundManager.setVolume(volume)
  }, [volume])

  // Handle sound toggle
  const handleToggleSound = () => {
    const newSoundState = !soundEnabled
    setSoundEnabled(newSoundState)
    soundManager.muted = !newSoundState

    if (newSoundState && !themeAudioRef.current) {
      themeAudioRef.current = soundManager.play("theme", true)
    } else if (!newSoundState && themeAudioRef.current) {
      soundManager.stop(themeAudioRef.current)
      themeAudioRef.current = null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 mb-4">
            CRYPTO CLASHERS™
          </h1>
          <p className="text-xl text-gray-300">The Ultimate Crypto Boxing Arena</p>
        </div>

        {/* Sound Controls */}
        <div className="absolute top-4 right-4">
          <SoundControls
            soundEnabled={soundEnabled}
            volume={volume}
            onToggleSound={handleToggleSound}
            onVolumeChange={setVolume}
          />
        </div>

        {/* Bull vs Bear Logo */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <Image
            src="/images/bull-vs-bear-logo.webp"
            alt="Bull vs Bear"
            width={800}
            height={400}
            className="w-full h-auto"
          />
        </div>

        <div className="grid gap-6">
          {/* Wallet Connection */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-blue-400" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription>
                Connect your wallet to start playing with real crypto assets or use demo mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <WalletConnector
                  userBalance={1000}
                  onConnectWallet={onConnectWallet}
                  onDisconnectWallet={onDisconnectWallet}
                  isWalletConnected={isWalletConnected}
                  walletAddress={walletAddress}
                />
              </div>
            </CardContent>
          </Card>

          {/* Age Verification */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-400" />
                Age Verification
              </CardTitle>
              <CardDescription>You must be at least 18 years old to play Crypto Clashers™.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="age-verification"
                  checked={isAgeVerified}
                  onCheckedChange={() => {
                    onVerifyAge()
                    soundManager.play("button")
                  }}
                />
                <label
                  htmlFor="age-verification"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am at least 18 years old
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-yellow-400" />
                Game Rules
              </CardTitle>
              <CardDescription>Please read and accept the game rules before playing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRules(!showRules)
                  soundManager.play("button")
                }}
                className="mb-4"
              >
                {showRules ? "Hide Rules" : "Show Rules"}
              </Button>

              {showRules && (
                <div className="bg-gray-800 p-4 rounded-md mb-4 max-h-60 overflow-y-auto">
                  <h3 className="font-bold mb-2">Crypto Clashers™ Rules</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>
                      Crypto Clashers™ is a game that simulates boxing matches between cryptocurrencies based on their
                      real-time market performance.
                    </li>
                    <li>Players can place bets on which cryptocurrency they think will win the match.</li>
                    <li>
                      Match outcomes are determined by the relative price movements and market performance of the
                      cryptocurrencies.
                    </li>
                    <li>Each round lasts 60 minutes to account for market movements.</li>
                    <li>Players can use the controls to influence the match by executing different boxing moves.</li>
                    <li>The game uses STYRD tokens for betting, which have no real-world value.</li>
                    <li>In Demo mode, all transactions are simulated and no real cryptocurrency is used.</li>
                    <li>The game is for entertainment purposes only and does not constitute financial advice.</li>
                    <li>
                      Market data is provided for informational purposes only and may not be accurate or up-to-date.
                    </li>
                    <li>
                      The developers of Crypto Clashers™ are not responsible for any financial losses incurred while
                      playing the game.
                    </li>
                    <li>The game may be updated or modified at any time without notice.</li>
                  </ol>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rules-acceptance"
                  checked={hasAcceptedRules}
                  onCheckedChange={() => {
                    onAcceptRules()
                    soundManager.play("button")
                  }}
                />
                <label
                  htmlFor="rules-acceptance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and accept the game rules
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              Crypto Clashers™ is a game for entertainment purposes only. Never bet more than you can afford to lose.
              All STYRD tokens used in the game have no real-world value. In Demo mode, all transactions are simulated.
            </p>
          </div>

          {/* Continue Button */}
          <CardFooter className="flex justify-center pt-4">
            <Button
              size="lg"
              disabled={!isAgeVerified || !hasAcceptedRules}
              onClick={() => {
                soundManager.play("button")
                onContinue()
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full max-w-md"
            >
              {isAgeVerified && hasAcceptedRules ? (
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Continue to Crypto Clashers™
                </div>
              ) : (
                "Please verify your age and accept the rules to continue"
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}

