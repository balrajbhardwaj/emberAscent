/**
 * Progress Dashboard Page
 * 
 * Shows comprehensive learning progress for the active child.
 * Available to all users (free tier).
 * 
 * Sections:
 * - Overview cards (total questions, streak, weekly, accuracy)
 * - Subject progress (VR, English, Maths)
 * - Weekly activity chart
 * - Recent activity timeline
 * - Weak areas (if any)
 * 
 * @module app/(dashboard)/progress/page
 */

import { BookOpen, Flame, TrendingUp, Target } from "lucide-react"
import { OverviewCard } from "@/components/progress/OverviewCard"
import { SubjectProgress } from "@/components/progress/SubjectProgress"
import { ActivityTimeline } from "@/components/progress/ActivityTimeline"
import { WeeklyChart } from "@/components/progress/WeeklyChart"
import { WeakAreasCard } from "@/components/progress/WeakAreasCard"
import {
  getOverviewStats,
  getSubjectStats,
  getRecentSessions,
  getDailyActivity,
  getWeakAreas,
} from "./actions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Get active child ID
 */
async function getActiveChild(): Promise<string | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", user.id)
    .eq("is_active", true)
    .single()

  return child?.id || null
}

/**
 * Progress Dashboard Page
 */
export default async function ProgressPage() {
  const childId = await getActiveChild()

  if (!childId) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">No Active Child</h1>
          <p className="text-slate-600">
            Please select or create a child profile to view progress.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all data in parallel
  const [overviewStats, subjectStats, recentSessions, dailyActivity, weakAreas] = await Promise.all([
    getOverviewStats(childId),
    getSubjectStats(childId),
    getRecentSessions(childId, 10),
    getDailyActivity(childId),
    getWeakAreas(childId, 3),
  ])

  // Subject colors and icons
  const subjectConfig = [
    { name: "Verbal Reasoning", color: "purple" as const, icon: "🧠" },
    { name: "English", color: "blue" as const, icon: "📚" },
    { name: "Mathematics", color: "green" as const, icon: "🔢" },
  ]

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-600 mt-2">
            Track your learning journey and identify areas for improvement
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            icon={BookOpen}
            label="Total Questions"
            value={overviewStats?.totalQuestions || 0}
            subtext="All time"
            color="blue"
          />
          <OverviewCard
            icon={Flame}
            label="Current Streak"
            value={overviewStats?.currentStreak || 0}
            subtext={overviewStats?.currentStreak === 1 ? "day" : "days"}
            color="orange"
          />
          <OverviewCard
            icon={TrendingUp}
            label="This Week"
            value={overviewStats?.weeklyQuestions || 0}
            subtext="questions"
            color="purple"
          />
          <OverviewCard
            icon={Target}
            label="Overall Accuracy"
            value={`${overviewStats?.overallAccuracy || 0}%`}
            color="green"
          />
        </div>

        {/* Subject Progress */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Subject Progress</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjectConfig.map((config) => {
              const stats = subjectStats.find((s) => s.subject === config.name)
              return (
                <SubjectProgress
                  key={config.name}
                  subject={config.name}
                  accuracy={stats?.accuracy || 0}
                  questionsAttempted={stats?.questionsAttempted || 0}
                  trend={stats?.trend || "neutral"}
                  trendValue={stats?.trendValue || 0}
                  color={config.color}
                  icon={config.icon}
                />
              )
            })}
          </div>
        </div>

        {/* Two column layout for charts and activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity Chart */}
          <WeeklyChart data={dailyActivity} />

          {/* Weak Areas Card (or empty state) */}
          <WeakAreasCard weakTopics={weakAreas} />
        </div>

        {/* Recent Activity Timeline */}
        <ActivityTimeline sessions={recentSessions} />

        {/* Encouragement Footer */}
        {overviewStats && overviewStats.totalQuestions > 0 && (
          <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌟</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Keep Up the Great Work!</h3>
                <p className="text-sm text-slate-700">
                  {overviewStats.currentStreak > 0
                    ? `You're on a ${overviewStats.currentStreak}-day streak! Practice daily to keep it going.`
                    : "Start a practice streak by answering questions every day!"}
                  {" "}
                  {overviewStats.overallAccuracy >= 70
                    ? "Your accuracy is excellent - keep challenging yourself!"
                    : "Focus on understanding each question to improve your accuracy."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* First-time user message */}
        {overviewStats && overviewStats.totalQuestions === 0 && (
          <div className="mt-8 p-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-5xl">🚀</div>
              <h3 className="text-xl font-semibold text-slate-900">Ready to Start Your Journey?</h3>
              <p className="text-slate-700">
                Your progress dashboard will light up as you practice! Start with a Quick Practice
                session to get familiar with the questions.
              </p>
              <a
                href="/practice"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Start Practicing Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
