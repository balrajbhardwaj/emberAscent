/**
 * Achievement System
 *
 * Functions for checking, unlocking, and tracking achievements
 */

import { createClient } from '@/lib/supabase/server'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  criteria: any // jsonb
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  category: 'practice' | 'streak' | 'mastery' | 'speed'
}

export interface ChildAchievement {
  id: string
  child_id: string
  achievement_id: string
  unlocked_at: string
  progress_data: any
  achievement: Achievement
}

/**
 * Get all achievements for a child (locked and unlocked)
 */
export async function getChildAchievements(childId: string) {
  const supabase = await createClient()

  // Get all achievements
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('points', { ascending: false })

  if (achievementsError) {
    console.error('[getChildAchievements] Error fetching achievements:', achievementsError)
    return { unlocked: [], locked: [] }
  }

  // Get child's unlocked achievements
  const { data: unlockedData, error: unlockedError } = await supabase
    .from('child_achievements')
    .select('*, achievement:achievements(*)')
    .eq('child_id', childId)
    .order('unlocked_at', { ascending: false })

  if (unlockedError) {
    console.error('[getChildAchievements] Error fetching unlocked:', unlockedError)
    return { unlocked: [], locked: allAchievements || [] }
  }

  const unlockedIds = new Set(unlockedData?.map((ca) => ca.achievement_id) || [])
  const locked = allAchievements?.filter((a) => !unlockedIds.has(a.id)) || []

  return {
    unlocked: unlockedData || [],
    locked,
  }
}

/**
 * Check and unlock achievements after a session
 */
export async function checkAchievementUnlocks(childId: string, sessionId: string) {
  const supabase = await createClient()
  const newUnlocks: Achievement[] = []

  // Get session data
  const { data: session } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return newUnlocks

  // Get all achievements not yet unlocked
  const { data: unlockedIds } = await supabase
    .from('child_achievements')
    .select('achievement_id')
    .eq('child_id', childId)

  const unlockedSet = new Set(unlockedIds?.map((u) => u.achievement_id) || [])

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')

  if (!achievements) return newUnlocks

  // Check each achievement's criteria
  for (const achievement of achievements) {
    if (unlockedSet.has(achievement.id)) continue // Already unlocked

    const shouldUnlock = await checkCriteria(childId, sessionId, achievement, supabase)
    if (shouldUnlock) {
      const unlocked = await unlockAchievement(childId, achievement.id)
      if (unlocked) {
        newUnlocks.push(achievement)
      }
    }
  }

  return newUnlocks
}

/**
 * Check if achievement criteria is met
 */
async function checkCriteria(
  childId: string,
  sessionId: string,
  achievement: Achievement,
  supabase: any
): Promise<boolean> {
  const { criteria } = achievement

  try {
    // First Flame - Complete first session
    if (criteria.type === 'first_session') {
      const { count } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .eq('status', 'completed')

      return (count || 0) === 1
    }

    // Streak Guardian - 7 day streak
    if (criteria.type === 'streak' && criteria.days) {
      const { data: child } = await supabase
        .from('children')
        .select('current_streak')
        .eq('id', childId)
        .single()

      return (child?.current_streak || 0) >= criteria.days
    }

    // Century Club - 100 correct answers
    if (criteria.type === 'total_correct' && criteria.count) {
      const { data } = await supabase
        .from('session_responses')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', childId)
        .eq('is_correct', true)

      return (data || 0) >= criteria.count
    }

    // Subject mastery - 80%+ accuracy on 20+ questions
    if (criteria.type === 'subject_mastery' && criteria.subject && criteria.min_questions && criteria.min_accuracy) {
      const { data: responses } = await supabase
        .from('session_responses')
        .select('is_correct')
        .eq('child_id', childId)
        .eq('subject', criteria.subject)

      if (!responses || responses.length < criteria.min_questions) return false

      const correct = responses.filter((r: { is_correct: boolean }) => r.is_correct).length
      const accuracy = (correct / responses.length) * 100

      return accuracy >= criteria.min_accuracy
    }

    // Speed Demon - Avg < 45s per question
    if (criteria.type === 'speed' && criteria.max_avg_time) {
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('total_questions, time_taken_seconds')
        .eq('child_id', childId)
        .eq('status', 'completed')
        .not('time_taken_seconds', 'is', null)

      if (!sessions || sessions.length === 0) return false

      const totalTime = sessions.reduce(
        (sum: number, s: { time_taken_seconds: number | null; total_questions: number }) =>
          sum + (s.time_taken_seconds || 0),
        0
      )
      const totalQuestions = sessions.reduce(
        (sum: number, s: { time_taken_seconds: number | null; total_questions: number }) =>
          sum + s.total_questions,
        0
      )
      const avgTime = totalTime / totalQuestions

      return avgTime <= criteria.max_avg_time
    }

    // Perfect Session - 100% accuracy
    if (criteria.type === 'perfect_session') {
      const { data: session } = await supabase
        .from('practice_sessions')
        .select('total_questions, correct_answers')
        .eq('id', sessionId)
        .single()

      return session && session.correct_answers === session.total_questions && session.total_questions > 0
    }

    // Mock Test Taker - Complete first mock
    if (criteria.type === 'first_mock') {
      const { count } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .eq('is_mock_test', true)
        .eq('status', 'completed')

      return (count || 0) === 1
    }

    return false
  } catch (error) {
    console.error('[checkCriteria] Error:', error)
    return false
  }
}

/**
 * Unlock an achievement for a child
 */
export async function unlockAchievement(childId: string, achievementId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('child_achievements')
    .insert({
      child_id: childId,
      achievement_id: achievementId,
      progress_data: {},
    })

  if (error) {
    console.error('[unlockAchievement] Error:', error)
    return false
  }

  return true
}

/**
 * Get recent achievement unlocks (for notifications)
 */
export async function getRecentUnlocks(childId: string, minutes: number = 5) {
  const supabase = await createClient()

  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('child_achievements')
    .select('*, achievement:achievements(*)')
    .eq('child_id', childId)
    .gte('unlocked_at', cutoff)
    .order('unlocked_at', { ascending: false })

  if (error) {
    console.error('[getRecentUnlocks] Error:', error)
    return []
  }

  return data || []
}
