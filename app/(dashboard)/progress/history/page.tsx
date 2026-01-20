/**
 * Session History Page
 * 
 * Displays filterable, paginated list of all practice sessions.
 * Allows filtering by date range, subject, and session type.
 * 
 * @module app/(dashboard)/progress/history
 */
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SessionHistoryTable } from "@/components/progress/SessionHistoryTable"
import { SessionHistoryFilters } from "@/components/progress/SessionHistoryFilters"
import { Pagination } from "@/components/progress/Pagination"
import { fetchSessionHistory } from "./actions"

interface PageProps {
  searchParams: {
    page?: string
    dateRange?: "7days" | "30days" | "all"
    subject?: string
    sessionType?: "quick" | "focus" | "mock"
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
 * Session History Page
 * 
 * Displays all practice sessions with filters and pagination.
 */
export default async function SessionHistoryPage({ searchParams }: PageProps) {
  const child = await getActiveChild()
  
  if (!child) {
    redirect("/onboarding")
  }
  
  // Parse search params
  const page = parseInt(searchParams.page || "1")
  const filters = {
    dateRange: searchParams.dateRange,
    subject: searchParams.subject,
    sessionType: searchParams.sessionType,
  }
  
  // Fetch session history with filters
  const historyData = await fetchSessionHistory(child.id, filters, page, 20)
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Session History
        </h1>
        <p className="text-slate-600">
          Review all past practice sessions for {child.name}
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <SessionHistoryFilters
            currentFilters={filters}
            totalSessions={historyData?.total || 0}
          />
        </Suspense>
      </div>
      
      {/* Session Table */}
      <div className="mb-6">
        <Suspense fallback={<SessionHistoryTableSkeleton />}>
          <SessionHistoryTable
            sessions={historyData?.sessions || []}
            isLoading={false}
          />
        </Suspense>
      </div>
      
      {/* Pagination */}
      {historyData && historyData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={historyData.page}
            totalPages={historyData.totalPages}
            baseUrl="/progress/history"
            filters={filters}
          />
        </div>
      )}
      
      {/* Stats footer */}
      {historyData && historyData.total > 0 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, historyData.total)} of {historyData.total} sessions
        </div>
      )}
    </div>
  )
}

/**
 * Loading skeleton for session table
 */
function SessionHistoryTableSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  )
}
