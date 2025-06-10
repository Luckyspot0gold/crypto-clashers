"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Volume1 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface SoundControlsProps {
  soundEnabled: boolean
  volume: number
  onToggleSound: () => void
  onVolumeChange: (value: number) => void
}

export default function SoundControls({ soundEnabled, volume, onToggleSound, onVolumeChange }: SoundControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowVolumeSlider(false)
    }

    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showVolumeSlider])

  // Prevent clicks on the control from closing the slider
  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Get the appropriate icon based on volume level
  const getVolumeIcon = () => {
    if (!soundEnabled) return <VolumeX className="h-4 w-4" />
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <div className="relative" onClick={handleControlClick}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
      >
        {getVolumeIcon()}
      </Button>

      {showVolumeSlider && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 w-48">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Volume</span>
            <Button variant="ghost" size="sm" onClick={onToggleSound} className="h-8 w-8 p-0">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          <Slider
            disabled={!soundEnabled}
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(values) => onVolumeChange(values[0])}
            className="my-4"
          />

          <div className="text-right text-xs text-gray-400">{Math.round(volume * 100)}%</div>
        </div>
      )}
    </div>
  )
}

