/**
 * Practice Page
 * 
 * Main practice landing page for children to start practicing.
 * 
 * Features:
 * - Personalized welcome with streak and daily progress
 * - Quick action cards for different practice modes
 * - Subject browser with progress tracking
 * - Recent activity feed
 * 
 * Data fetched:
 * - Child's recent practice sessions
 * - Progress by subject (from question attempts)
 * - Current streak (consecutive days with practice)
 * - Today's question count
 * 
 * @module app/(dashboard)/practice/page
 */

import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { WelcomeCard } from "@/components/practice/WelcomeCard"
import { QuickActionsSection } from "@/components/practice/QuickActionsSection"
import { SubjectBrowser } from "@/components/practice/SubjectBrowser"
import { RecentActivity } from "@/components/practice/RecentActivity"
import { PracticeSkeleton } from "@/components/practice/PracticeSkeleton"

/**
 * Practice Home Page
 * 
 * Server component that fetches practice data and renders the practice home interface.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: { childId?: string }
}) {
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticeContent childId={searchParams.childId} />
    </Suspense>
  )
}

/**
 * Practice Content Component
 * 
 * Fetches and displays practice data for the selected child.
 */
async function PracticeContent({ childId }: { childId?: string }) {
  const supabase = await createClient()

  // Get current user's children
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .eq("is_active", true)

  if (!children || children.length === 0) return null

  // Determine selected child
  const selectedChild = childId
    ? children.find((c) => c.id === childId) || children[0]
    : children[0]

  // Fetch recent practice sessions
  const { data: recentSessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("child_id", selectedChild.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // TODO: Fetch today's question count
  const questionsToday = 0

  // TODO: Calculate current streak
  const currentStreak = 0

  // Mock subject progress data (will be calculated from real data later)
  const subjects = [
    {
      name: "Verbal Reasoning",
      icon: "🧠",
      progress: 25,
      topicsMastered: 3,
      totalTopics: 12,
      color: "bg-violet-400",
    },
    {
      name: "English",
      icon: "📚",
      progress: 40,
      topicsMastered: 6,
      totalTopics: 15,
      color: "bg-sky-400",
    },
    {
      name: "Maths",
      icon: "🔢",
      progress: 15,
      topicsMastered: 2,
      totalTopics: 14,
      color: "bg-emerald-400",
    },
  ]

  // Format sessions for RecentActivity component
  const formattedSessions = (recentSessions || []).map((session) => ({
    id: session.id,
    date: new Date(session.created_at),
    subject: session.subject || "Mixed", // Use session subject or default to Mixed
    questionsCorrect: session.correct_answers || 0,
    questionsTotal: session.total_questions || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        childName={selectedChild.name}
        currentStreak={currentStreak}
        questionsToday={questionsToday}
      />

      {/* Quick Actions */}
      <QuickActionsSection childId={selectedChild.id} />

      {/* Subject Browser */}
      <SubjectBrowser subjects={subjects} childId={selectedChild.id} />

      {/* Recent Activity */}
      <RecentActivity sessions={formattedSessions} />
    </div>
  )
}

