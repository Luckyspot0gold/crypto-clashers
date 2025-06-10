"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, X, Trophy, TrendingUp, Zap, Target, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementsProps {
  userStats: {
    matchesPlayed: number
    matchesWon: number
    totalBets: number
    highestWin: number
  }
}

export default function Achievements({ userStats }: AchievementsProps) {
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  // Define achievements
  const achievements: Achievement[] = [
    {
      id: "first_match",
      title: "First Blood",
      description: "Watch your first crypto match",
      icon: <Zap className="h-5 w-5 text-blue-400" />,
      unlocked: userStats.matchesPlayed >= 1,
    },
    {
      id: "first_bet",
      title: "Risk Taker",
      description: "Place your first bet",
      icon: <Coins className="h-5 w-5 text-yellow-400" />,
      unlocked: userStats.totalBets >= 1,
    },
    {
      id: "first_win",
      title: "Market Oracle",
      description: "Win your first bet",
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      unlocked: userStats.matchesWon >= 1,
    },
    {
      id: "five_matches",
      title: "Market Analyst",
      description: "Watch 5 crypto matches",
      icon: <Target className="h-5 w-5 text-purple-400" />,
      unlocked: userStats.matchesPlayed >= 5,
      progress: Math.min(userStats.matchesPlayed, 5),
      maxProgress: 5,
    },
    {
      id: "big_win",
      title: "Whale Alert",
      description: "Win a bet of 500 STYRD or more",
      icon: <Trophy className="h-5 w-5 text-amber-400" />,
      unlocked: userStats.highestWin >= 500,
      progress: Math.min(userStats.highestWin, 500),
      maxProgress: 500,
    },
  ]

  // Check for newly unlocked achievements
  useEffect(() => {
    const checkNewAchievements = () => {
      // Get previously unlocked achievements from localStorage
      const unlockedAchievements = JSON.parse(localStorage.getItem("unlockedAchievements") || "[]")

      // Find newly unlocked achievements
      const newlyUnlocked = achievements.filter(
        (achievement) => achievement.unlocked && !unlockedAchievements.includes(achievement.id),
      )

      if (newlyUnlocked.length > 0) {
        // Show notification for the first newly unlocked achievement
        setNewAchievement(newlyUnlocked[0])

        // Update localStorage
        localStorage.setItem(
          "unlockedAchievements",
          JSON.stringify([...unlockedAchievements, ...newlyUnlocked.map((a) => a.id)]),
        )

        // Hide notification after 5 seconds
        setTimeout(() => {
          setNewAchievement(null)
        }, 5000)
      }
    }

    checkNewAchievements()
  }, [userStats])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAchievements(true)}
        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
      >
        <Award className="h-4 w-4 mr-2 text-yellow-400" />
        Achievements
      </Button>

      {/* Achievements panel */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-400" />
                  Achievements
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowAchievements(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                <div className="grid gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.unlocked
                          ? "bg-gray-800/50 border-yellow-600/50"
                          : "bg-gray-800/20 border-gray-700 opacity-70"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`p-2 rounded-full mr-3 ${
                            achievement.unlocked ? "bg-yellow-500/20" : "bg-gray-700/50"
                          }`}
                        >
                          {achievement.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{achievement.title}</h3>
                            {achievement.unlocked && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                Unlocked
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>

                          {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>
                                  {achievement.progress} / {achievement.maxProgress}
                                </span>
                                <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${achievement.unlocked ? "bg-yellow-500" : "bg-blue-600"}`}
                                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New achievement notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-yellow-600 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start">
              <div className="p-2 bg-yellow-500/20 rounded-full mr-3">{newAchievement.icon}</div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-yellow-400">Achievement Unlocked!</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewAchievement(null)}
                    className="h-6 w-6 p-0 -mt-1 -mr-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <p className="font-medium mt-1">{newAchievement.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{newAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

