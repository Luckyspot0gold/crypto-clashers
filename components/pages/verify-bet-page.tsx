"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, DollarSign } from "lucide-react"

interface VerifyBetPageProps {
  leftFighter: any
  rightFighter: any
  betAmount: number
  betOn: string | null
  onConfirm: () => void
  onCancel: () => void
}

export default function VerifyBetPage({
  leftFighter,
  rightFighter,
  betAmount,
  betOn,
  onConfirm,
  onCancel,
}: VerifyBetPageProps) {
  // Determine which fighter was bet on
  const selectedFighter = betOn === leftFighter.name ? leftFighter : rightFighter
  const otherFighter = betOn === leftFighter.name ? rightFighter : leftFighter

  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Confirm Your Bet</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">{selectedFighter.icon}</div>
            <h3 className="text-xl font-bold mb-2">{betOn}</h3>
            <div className="flex items-center justify-center text-2xl font-bold text-green-400">
              <DollarSign className="h-5 w-5 mr-1" />
              {betAmount} STYRD
            </div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Please verify your bet details:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    You are betting {betAmount} STYRD on {betOn}
                  </li>
                  <li>
                    If {betOn} wins, you will receive {betAmount * 2} STYRD
                  </li>
                  <li>If {betOn} loses, you will lose your bet</li>
                  <li>In case of a draw, your bet will be refunded</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-5xl mb-2">{selectedFighter.icon}</div>
              <div className="font-bold">{selectedFighter.name}</div>
            </div>

            <div className="text-2xl font-bold text-gray-500">VS</div>

            <div className="text-center">
              <div className="text-5xl mb-2">{otherFighter.icon}</div>
              <div className="font-bold">{otherFighter.name}</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirm Bet & Start Match
          </Button>

          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel and Return
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

