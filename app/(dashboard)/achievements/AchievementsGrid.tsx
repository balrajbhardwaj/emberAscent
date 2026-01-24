'use client'

/**
 * Achievements Grid Component
 *
 * Displays achievements in a grid with filtering by category and rarity
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { Achievement, ChildAchievement } from '@/lib/gamification/achievements'

interface AchievementsGridProps {
  unlocked: ChildAchievement[]
  locked: Achievement[]
}

export default function AchievementsGrid({ unlocked, locked }: AchievementsGridProps) {
  const [filter, setFilter] = useState<'all' | 'practice' | 'streak' | 'mastery' | 'speed'>('all')

  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-amber-100 border-amber-300',
    mythic: 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-300',
  }

  const rarityBadgeColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500',
    mythic: 'bg-gradient-to-r from-pink-500 to-purple-500',
  }

  const filterAchievements = (items: any[]) => {
    if (filter === 'all') return items
    return items.filter((item) => {
      const achievement = 'achievement' in item ? item.achievement : item
      return achievement.category === filter
    })
  }

  const filteredUnlocked = filterAchievements(unlocked)
  const filteredLocked = filterAchievements(locked)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'practice' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('practice')}
        >
          Practice
        </Button>
        <Button
          variant={filter === 'streak' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('streak')}
        >
          Streak
        </Button>
        <Button
          variant={filter === 'mastery' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('mastery')}
        >
          Mastery
        </Button>
        <Button
          variant={filter === 'speed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('speed')}
        >
          Speed
        </Button>
      </div>

      {/* Unlocked Achievements */}
      {filteredUnlocked.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Unlocked ({filteredUnlocked.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUnlocked.map((ca) => {
              const achievement = ca.achievement
              return (
                <Card
                  key={ca.id}
                  className={`border-2 ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold">{achievement.name}</h3>
                          <Badge
                            className={`text-xs ${rarityBadgeColors[achievement.rarity as keyof typeof rarityBadgeColors]}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-primary">
                            +{achievement.points} points
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(ca.unlocked_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {filteredLocked.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Locked ({filteredLocked.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLocked.map((achievement) => (
              <Card
                key={achievement.id}
                className="border-2 border-dashed opacity-60 hover:opacity-100 transition-opacity"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          {achievement.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-3">
                        <span className="text-sm font-semibold text-muted-foreground">
                          +{achievement.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No achievements in this category yet
        </div>
      )}
    </div>
  )
}
