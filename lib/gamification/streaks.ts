/**
 * Streak Management System
 *
 * Functions for tracking and managing practice streaks
 */

import { createClient } from '@/lib/supabase/server'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastPracticeDate: string | null
  freezesAvailable: number
  freezesUsed: number
}

/**
 * Update streak after a practice session
 */
export async function updateStreak(childId: string, practiceDate: Date = new Date()): Promise<boolean> {
  const supabase = await createClient()

  // Get current child data
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('current_streak, longest_streak, last_practice_date, streak_freezes_available')
    .eq('id', childId)
    .single()

  if (childError || !child) {
    console.error('[updateStreak] Error fetching child:', childError)
    return false
  }

  const today = practiceDate.toISOString().split('T')[0]
  const lastPractice = child.last_practice_date

  let newStreak = child.current_streak || 0
  let newLongest = child.longest_streak || 0

  if (!lastPractice) {
    // First ever practice
    newStreak = 1
  } else {
    const lastDate = new Date(lastPractice)
    const daysDiff = Math.floor(
      (practiceDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === 0) {
      // Same day, no change
      return true
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1
    } else {
      // Streak broken
      newStreak = 1
    }
  }

  // Update longest if needed
  if (newStreak > newLongest) {
    newLongest = newStreak
  }

  // Update database
  const { error: updateError } = await supabase
    .from('children')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_practice_date: today,
    })
    .eq('id', childId)

  if (updateError) {
    console.error('[updateStreak] Error updating:', updateError)
    return false
  }

  return true
}

/**
 * Check if streak is at risk (no practice today)
 */
export async function checkStreakStatus(childId: string): Promise<{
  isAtRisk: boolean
  currentStreak: number
  lastPracticeDate: string | null
}> {
  const supabase = await createClient()

  const { data: child } = await supabase
    .from('children')
    .select('current_streak, last_practice_date')
    .eq('id', childId)
    .single()

  if (!child) {
    return { isAtRisk: false, currentStreak: 0, lastPracticeDate: null }
  }

  const today = new Date().toISOString().split('T')[0]
  const isAtRisk = child.last_practice_date !== today && (child.current_streak || 0) > 0

  return {
    isAtRisk,
    currentStreak: child.current_streak || 0,
    lastPracticeDate: child.last_practice_date,
  }
}

/**
 * Use a streak freeze (Ascent+ feature)
 */
export async function useStreakFreeze(childId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get current freezes
  const { data: child } = await supabase
    .from('children')
    .select('streak_freezes_available')
    .eq('id', childId)
    .single()

  if (!child || (child.streak_freezes_available || 0) <= 0) {
    return false
  }

  // Set last practice to today to preserve streak
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('children')
    .update({
      streak_freezes_available: (child.streak_freezes_available || 0) - 1,
      last_practice_date: today,
    })
    .eq('id', childId)

  if (error) {
    console.error('[useStreakFreeze] Error:', error)
    return false
  }

  return true
}

/**
 * Get practice history for calendar display
 */
export async function getStreakHistory(childId: string, days: number = 30) {
  const supabase = await createClient()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get all completed sessions in date range
  const { data: sessions, error } = await supabase
    .from('practice_sessions')
    .select('created_at, status')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    console.error('[getStreakHistory] Error:', error)
    return []
  }

  // Group by date
  const dateMap = new Map<string, number>()
  sessions?.forEach((session) => {
    const date = session.created_at.split('T')[0]
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })

  // Build calendar array
  const calendar = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    calendar.push({
      date: dateStr,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      practiced: dateMap.has(dateStr),
      sessionCount: dateMap.get(dateStr) || 0,
    })
  }

  return calendar
}

/**
 * Grant streak freezes (for Ascent+ subscribers)
 */
export async function grantStreakFreezes(childId: string, count: number): Promise<boolean> {
  const supabase = await createClient()

  const { data: child } = await supabase
    .from('children')
    .select('streak_freezes_available')
    .eq('id', childId)
    .single()

  if (!child) return false

  const { error } = await supabase
    .from('children')
    .update({
      streak_freezes_available: (child.streak_freezes_available || 0) + count,
    })
    .eq('id', childId)

  if (error) {
    console.error('[grantStreakFreezes] Error:', error)
    return false
  }

  return true
}
