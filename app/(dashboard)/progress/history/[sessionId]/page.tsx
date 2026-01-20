/**
 * Session Detail Page
 * 
 * Displays comprehensive review of a single practice session.
 * Shows score summary, subject breakdown, and question-by-question review.
 * 
 * @module app/(dashboard)/progress/history/[sessionId]
 */
import { Suspense } from "react"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Target } from "lucide-react"
import { SessionDetailCard } from "@/components/progress/SessionDetailCard"
import { QuestionReviewList } from "@/components/progress/QuestionReviewList"
import { fetchSessionDetail } from "../actions"

interface PageProps {
  params: {
    sessionId: string
  }
}

/**
 * Get the active child for the authenticated user
 */
async function getActiveChild() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id)
    .eq("is_active", true)
    .single()
  
  return child
}

/**
 * Session Detail Page
 * 
 * Full review page for a practice session.
 */
export default async function SessionDetailPage({ params }: PageProps) {
  const child = await getActiveChild()
  
  if (!child) {
    redirect("/onboarding")
  }
  
  // Fetch session detail
  const sessionDetail = await fetchSessionDetail(params.sessionId)
  
  if (!sessionDetail) {
    notFound()
  }
  
  // Extract primary subject from breakdown (most questions)
  const primarySubject = sessionDetail.subjectBreakdown.length > 0
    ? sessionDetail.subjectBreakdown.reduce((prev, current) =>
        current.total > prev.total ? current : prev
      ).subject
    : undefined
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/progress/history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Link>
        </Button>
      </div>
      
      {/* Session Summary Card */}
      <div className="mb-6">
        <Suspense fallback={<SessionDetailSkeleton />}>
          <SessionDetailCard
            sessionType={sessionDetail.sessionType}
            date={sessionDetail.date}
            score={sessionDetail.score}
            questionsAnswered={sessionDetail.questionsAnswered}
            totalQuestions={sessionDetail.totalQuestions}
            duration={sessionDetail.duration}
            subjectBreakdown={sessionDetail.subjectBreakdown}
          />
        </Suspense>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button asChild className="flex-1">
          <Link href="/practice">
            <Target className="h-4 w-4 mr-2" />
            Practice Again
          </Link>
        </Button>
        {primarySubject && (
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/practice/focus?subject=${encodeURIComponent(primarySubject)}`}>
              Focus on {primarySubject}
            </Link>
          </Button>
        )}
      </div>
      
      {/* Question Review */}
      <div className="mb-6">
        <Suspense fallback={<QuestionReviewSkeleton />}>
          <QuestionReviewList questions={sessionDetail.questions} />
        </Suspense>
      </div>
      
      {/* Tips Footer */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">
              Learning Tip
            </h4>
            <p className="text-sm text-slate-700">
              Review incorrect answers carefully. Understanding why an answer is wrong
              is just as important as knowing the right answer. Use the explanations
              to strengthen your understanding.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Loading skeleton for session detail card
 */
function SessionDetailSkeleton() {
  return (
    <Card className="p-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </Card>
  )
}

/**
 * Loading skeleton for question review list
 */
function QuestionReviewSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-20 w-full" />
        </Card>
      ))}
    </div>
  )
}
