"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"

interface BattleLogProps {
  logs: string[]
}

export default function BattleLog({ logs }: BattleLogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [logs])

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Battle Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] rounded-md border border-gray-800 p-4" ref={scrollAreaRef}>
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Battle log will appear here once the match begins</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                // Check for different message types
                const isFuryModeMessage = log.includes("FURY MODE")
                const isComboMessage = log.includes("COMBO!")
                const isSpecialChargedMessage = log.includes("SPECIAL MOVE CHARGED")

                let messageClass = "text-sm"
                if (isFuryModeMessage) {
                  messageClass += " text-red-500 font-bold"
                } else if (isComboMessage) {
                  messageClass += " text-yellow-500 font-bold"
                } else if (isSpecialChargedMessage) {
                  messageClass += " text-green-500 font-bold"
                }

                return <div key={index} className={messageClass} dangerouslySetInnerHTML={{ __html: log }} />
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
