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
import { QuickReviewSection } from "@/components/practice/QuickReviewSection"
import { QuickActionsSection } from "@/components/practice/QuickActionsSection"
import { SubjectBrowser } from "@/components/practice/SubjectBrowser"
import { RecentActivity } from "@/components/practice/RecentActivity"
import { PracticeSkeleton } from "@/components/practice/PracticeSkeleton"
import { hasCompletedQuickByteToday } from "./quick-byte/actions"

// Force dynamic rendering to respect childId param changes
export const dynamic = 'force-dynamic'

/**
 * Practice Home Page
 * 
 * Server component that fetches practice data and renders the practice home interface.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>
}) {
  const params = await searchParams
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticeContent childId={params.childId} />
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
    .order("created_at", { ascending: false })

  if (!children || children.length === 0) return null

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const subscriptionTier = profile?.subscription_tier || 'free'

  // Determine selected child - match by ID from URL parameter
  const selectedChild = childId
    ? children.find((c: any) => c.id === childId) || children[0]
    : children[0]

  // Fetch recent practice sessions (only completed ones for Recent Activity)
  const { data: recentSessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("child_id", (selectedChild as any).id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(3)

  // Calculate today's question count from attempts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayAttempts } = await supabase
    .from("question_attempts")
    .select("id")
    .eq("child_id", (selectedChild as any).id)
    .gte("created_at", today.toISOString())
  
  const questionsToday = todayAttempts?.length || 0

  // TODO: Calculate current streak
  const currentStreak = 0

  // Check if Quick Byte was completed today
  const quickByteCompletedToday = await hasCompletedQuickByteToday((selectedChild as any).id)

  // Fetch 4 random questions for Quick Review (only if not completed today)
  const { data: quickReviewQuestions } = await supabase
    .from("questions")
    .select("id, subject, question_text, options, correct_answer, explanations")
    .eq("is_published", true)
    .limit(100) // Get a pool to randomize from
  
  // Randomly select 4 questions from different subjects if possible
  const selectedQuickQuestions = quickReviewQuestions
    ?.sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((q: any) => {
      // Map options and ensure IDs are consistent
      const mappedOptions = q.options.map((opt: any) => ({
        id: opt.id,
        text: opt.option_text || opt.text,
        isCorrect: opt.is_correct || false,
      }))
      
      // Find correct answer ID - use correct_answer field if available, otherwise find from options
      const correctAnswerId = q.correct_answer || 
        mappedOptions.find((opt: any) => opt.isCorrect)?.id || 
        ""
      
      return {
        id: q.id,
        subject: q.subject,
        questionText: q.question_text,
        options: mappedOptions.map((opt: any) => ({ id: opt.id, text: opt.text })),
        correctAnswerId: correctAnswerId,
        explanation: q.explanations?.step_by_step || "Great job!",
      }
    }) || []

  // Calculate real subject progress from question attempts
  const { data: topicProgress } = await supabase
    .from("question_attempts")
    .select(`
      question_id,
      questions!inner(subject, topic)
    `)
    .eq("child_id", (selectedChild as any).id)

  // Get all unique topics per subject from questions table
  const { data: allQuestions } = await supabase
    .from("questions")
    .select("subject, topic")
    .eq("is_published", true)
    .not("topic", "is", null)

  // Calculate topics mastered by subject
  const topicsBySubject = new Map<string, Set<string>>()
  const masteredTopicsBySubject = new Map<string, Set<string>>()

  // Count all available topics
  allQuestions?.forEach((q: any) => {
    if (!topicsBySubject.has(q.subject)) {
      topicsBySubject.set(q.subject, new Set())
    }
    topicsBySubject.get(q.subject)!.add(q.topic!)
  })

  // Count mastered topics (topics the child has practiced)
  topicProgress?.forEach((attempt: any) => {
    const subject = attempt.questions.subject
    const topic = attempt.questions.topic
    if (!masteredTopicsBySubject.has(subject)) {
      masteredTopicsBySubject.set(subject, new Set())
    }
    if (topic) {
      masteredTopicsBySubject.get(subject)!.add(topic)
    }
  })

  // Build subjects array with real data
  const subjectConfig = [
    { name: "Verbal Reasoning", icon: "🧠", color: "bg-violet-400" },
    { name: "English", icon: "📚", color: "bg-sky-400" },
    { name: "Maths", icon: "🔢", color: "bg-emerald-400" },
  ]

  const subjects = subjectConfig.map((config) => {
    const totalTopics = topicsBySubject.get(config.name)?.size || 0
    const topicsMastered = masteredTopicsBySubject.get(config.name)?.size || 0
    const progress = totalTopics > 0 ? Math.round((topicsMastered / totalTopics) * 100) : 0

    return {
      ...config,
      progress,
      topicsMastered,
      totalTopics,
    }
  })

  // Format sessions for RecentActivity component
  // Calculate from attempts if database field is 0 (due to previous PATCH errors)
  const formattedSessions = await Promise.all(
    (recentSessions || []).map(async (session: any) => {
      let correct = session.correct_answers || 0
      let total = session.total_questions || 0
      
      // Always calculate from attempts to ensure accuracy
      // (Some older sessions may have incorrect database values due to PATCH errors)
      const { data: attempts } = await supabase
        .from("question_attempts")
        .select("is_correct")
        .eq("session_id", session.id)
      
      if (attempts && attempts.length > 0) {
        total = attempts.length
        correct = attempts.filter((a: any) => a.is_correct).length
      }
      
      return {
        id: session.id,
        date: new Date(session.created_at),
        subject: session.subject || "Mixed",
        questionsCorrect: correct,
        questionsTotal: total,
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        childName={selectedChild.name}
        currentStreak={currentStreak}
        questionsToday={questionsToday}
      />

      {/* Quick Review Section - NEW! Always visible, shows completion message when done */}
      {selectedQuickQuestions.length > 0 && (
        <QuickReviewSection 
          questions={selectedQuickQuestions} 
          childId={(selectedChild as any).id}
          isCompletedToday={quickByteCompletedToday}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsSection childId={(selectedChild as any).id} subscriptionTier={subscriptionTier} />

      {/* Subject Browser */}
      <SubjectBrowser subjects={subjects} childId={(selectedChild as any).id} />

      {/* Recent Activity */}
      <RecentActivity sessions={formattedSessions} />
    </div>
  )
}

