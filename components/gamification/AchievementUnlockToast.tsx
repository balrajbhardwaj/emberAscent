'use client'

/**
 * Achievement Unlock Toast
 *
 * Celebratory notification when an achievement is unlocked
 */

import { useEffect } from 'react'
import { Achievement } from '@/lib/gamification/achievements'
import { toast } from 'sonner'
import { Trophy, Sparkles } from 'lucide-react'

interface AchievementUnlockToastProps {
  achievements: Achievement[]
}

export default function AchievementUnlockToast({
  achievements,
}: AchievementUnlockToastProps) {
  useEffect(() => {
    achievements.forEach((achievement) => {
      toast.custom(
        (_t) => (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-amber-900">Achievement Unlocked!</span>
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <div className="font-semibold text-gray-900">{achievement.name}</div>
                <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    +{achievement.points} points
                  </span>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded capitalize">
                    {achievement.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-center',
        }
      )
    })
  }, [achievements])

  return null
}
