"use client"

import { useState } from "react"
import { Wallet, CircleDollarSign, Shield, AlertTriangle, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface WalletConnectorProps {
  userBalance: number
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  isWalletConnected: boolean
  walletAddress?: string
}

export default function WalletConnector({
  userBalance,
  onConnectWallet,
  onDisconnectWallet,
  isWalletConnected,
  walletAddress = "",
}: WalletConnectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  // Mock wallet providers
  const walletProviders = [
    { id: "phantom", name: "Phantom", icon: "👻", popular: true },
    { id: "solflare", name: "Solflare", icon: "🔆", popular: true },
    { id: "backpack", name: "Backpack", icon: "🎒", popular: false },
    { id: "glow", name: "Glow", icon: "✨", popular: false },
  ]

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  // Simulate connecting wallet
  const connectWallet = (providerId: string) => {
    console.log(`Connecting to ${providerId}...`)
    onConnectWallet()
    setIsDialogOpen(false)
  }

  return (
    <>
      <Button
        variant={isWalletConnected ? "outline" : "default"}
        className={cn(
          "relative group",
          isWalletConnected ? "bg-green-900/20 hover:bg-green-900/30 text-green-500 border-green-800" : "",
        )}
        onClick={() => (isWalletConnected ? null : setIsDialogOpen(true))}
      >
        <div className="flex items-center">
          {isWalletConnected ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span>{formatAddress(walletAddress)}</span>

              {/* Dropdown menu for connected wallet */}
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-gray-900 border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                    <div className="font-medium text-white">Connected Wallet</div>
                    <div className="truncate">{walletAddress}</div>
                  </div>

                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    onClick={copyAddress}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {showCopied ? "Copied!" : "Copy Address"}
                  </button>

                  <a
                    href={`https://explorer.solana.com/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </a>

                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                    onClick={onDisconnectWallet}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </div>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Wallet className="mr-2 h-5 w-5 text-blue-400" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription>
              Connect your wallet to start playing Crypto Clashers™ with real crypto assets.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Shield className="mr-2 h-4 w-4 text-green-500" />
                Popular Wallets
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {walletProviders
                  .filter((w) => w.popular)
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                      onClick={() => connectWallet(wallet.id)}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{wallet.icon}</div>
                        <span>{wallet.name}</span>
                      </div>
                      <CircleDollarSign className="h-4 w-4 text-blue-400" />
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Other Wallets</h3>

              <div className="grid grid-cols-2 gap-3">
                {walletProviders
                  .filter((w) => !w.popular)
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                      onClick={() => connectWallet(wallet.id)}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{wallet.icon}</div>
                        <span>{wallet.name}</span>
                      </div>
                      <CircleDollarSign className="h-4 w-4 text-blue-400" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <div className="text-sm text-gray-400 mb-4 sm:mb-0">
              <AlertTriangle className="inline-block h-4 w-4 mr-1 text-yellow-500" />
              Demo mode uses simulated tokens only
            </div>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

