/**
 * Achievements Page
 *
 * Display all achievements (locked and unlocked) for the active child
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getChildAchievements } from '@/lib/gamification/achievements'
import AchievementsGrid from './AchievementsGrid'

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get active child
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_child_id')
    .eq('id', user.id)
    .single()

  if (!profile?.active_child_id) {
    redirect('/setup')
  }

  // Get child details
  const { data: child } = await supabase
    .from('children')
    .select('first_name')
    .eq('id', profile.active_child_id)
    .single()

  // Get achievements
  const { unlocked, locked } = await getChildAchievements(profile.active_child_id)

  // Calculate stats
  const totalPoints = unlocked.reduce((sum, ca) => sum + (ca.achievement?.points || 0), 0)
  const totalAchievements = unlocked.length + locked.length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground mt-1">
            {child?.first_name}'s accomplishments
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">Total Points</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{unlocked.length}</div>
          <div className="text-sm text-muted-foreground">Unlocked</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{locked.length}</div>
          <div className="text-sm text-muted-foreground">To Unlock</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {Math.round((unlocked.length / totalAchievements) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Completion</div>
        </div>
      </div>

      <AchievementsGrid unlocked={unlocked} locked={locked} />
    </div>
  )
}
