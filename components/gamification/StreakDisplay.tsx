'use client'

/**
 * Streak Display Component
 *
 * Shows current streak with flame icon and encouragement
 */

import { Card, CardContent } from '@/components/ui/card'
import { Flame, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  isAtRisk?: boolean
  freezesAvailable?: number
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  isAtRisk = false,
  freezesAvailable = 0,
}: StreakDisplayProps) {
  const getFlameColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400'
    if (streak < 7) return 'text-orange-500'
    if (streak < 30) return 'text-orange-600'
    if (streak < 100) return 'text-red-600'
    return 'text-purple-600'
  }

  const getMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!'
    if (streak === 1) return '🎉 Streak started!'
    if (streak < 7) return `Keep going! ${7 - streak} days to Streak Guardian`
    if (streak < 30) return `Fantastic! ${30 - streak} days to 30-day milestone`
    if (streak < 100) return `Amazing! ${100 - streak} days to Century Club`
    return 'Legendary streak! You\'re a true champion! 🏆'
  }

  return (
    <Card className={`${isAtRisk ? 'border-red-500 bg-red-50' : 'border-orange-200'}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Flame className={`h-12 w-12 ${getFlameColor(currentStreak)} ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
            <div>
              <div className="text-3xl font-bold">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          
          <div className="text-right">
            {longestStreak > currentStreak && (
              <div className="text-sm text-muted-foreground">
                Best: {longestStreak} days
              </div>
            )}
            {freezesAvailable > 0 && (
              <Badge variant="secondary" className="mt-1">
                <Snowflake className="h-3 w-3 mr-1" />
                {freezesAvailable} {freezesAvailable === 1 ? 'freeze' : 'freezes'}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          {isAtRisk ? (
            <p className="text-sm text-red-700 font-semibold">
              ⚠️ Practice today to keep your {currentStreak} day streak!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {getMessage(currentStreak)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
