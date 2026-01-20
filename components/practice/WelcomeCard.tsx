/**
 * Welcome Card Component
 * 
 * Displays personalized welcome message for the child with:
 * - Friendly greeting with child's name
 * - Current streak badge (consecutive days of practice)
 * - Today's progress (questions completed today)
 * 
 * @module components/practice/WelcomeCard
 */
"use client"

import { Flame, Target } from "lucide-react"
import { Card } from "@/components/ui/card"

interface WelcomeCardProps {
  childName: string
  currentStreak: number
  questionsToday: number
}

/**
 * Welcome Card
 * 
 * Personalized greeting card showing child's name, streak, and daily progress.
 * 
 * @param childName - Name of the child to greet
 * @param currentStreak - Number of consecutive days with practice activity
 * @param questionsToday - Number of questions answered today
 */
export function WelcomeCard({
  childName,
  currentStreak,
  questionsToday,
}: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg">
      <div className="space-y-4">
        {/* Greeting */}
        <h1 className="text-2xl font-bold sm:text-3xl">
          Hi {childName}! Ready to practice? 🎯
        </h1>

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          {/* Streak */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Flame className="h-5 w-5" />
              <div>
                <p className="text-xs font-medium opacity-90">Current Streak</p>
                <p className="text-lg font-bold">
                  {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Today's Progress */}
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
            <Target className="h-5 w-5" />
            <div>
              <p className="text-xs font-medium opacity-90">Today</p>
              <p className="text-lg font-bold">
                {questionsToday} question{questionsToday !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
