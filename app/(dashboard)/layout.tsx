/**
 * Dashboard Layout
 * 
 * Main layout wrapper for all dashboard pages.
 * Provides the structure with sidebar, header, and content area.
 * 
 * Layout Structure:
 * - Server Component: Fetches user and children data
 * - Sidebar: Desktop navigation (hidden on mobile)
 * - Header: Child selector and account menu
 * - Main Content: Page content with padding
 * - Mobile Nav: Bottom navigation (hidden on desktop)
 * - Dashboard Context: Provides user/child state to all components
 * 
 * Authentication:
 * - Requires authenticated user
 * - Redirects to /login if not authenticated
 * - Redirects to /setup if user has no children
 * 
 * @module app/(dashboard)/layout
 */
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { createClient } from "@/lib/supabase/server"
import { DashboardProvider } from "@/contexts/DashboardContext"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
import { MobileNav } from "@/components/dashboard/MobileNav"

interface DashboardLayoutProps {
  children: React.ReactNode
  searchParams?: { childId?: string }
}

export default async function DashboardLayout({
  children: childrenProp,
  searchParams = {},
}: DashboardLayoutProps) {
  // Require authentication
  const user = await requireAuth()

  // Fetch user's children
  const supabase = await createClient()
  const { data: childrenData, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching children:", error)
  }

  // If no children, redirect to setup
  if (!childrenData || childrenData.length === 0) {
    redirect("/setup")
  }

  // Determine selected child
  // 1. From URL param if provided  
  // 2. Otherwise, first child in list
  let selectedChild = childrenData[0]
  if (searchParams?.childId && childrenData.length > 0) {
    const childFromParam = childrenData.find((c) => c.id === searchParams?.childId)
    if (childFromParam) {
      selectedChild = childFromParam
    }
  }

  // Additional safety check
  if (!selectedChild) {
    redirect("/setup")
  }

  // Fetch subscription tier (for header display)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, subscription_status")
    .eq("id", user.id)
    .single()

  const subscriptionTier = profile?.subscription_tier || "free"

  // TODO: Fetch current streak (placeholder for now)
  const currentStreak = 0

  return (
    <DashboardProvider
      user={user}
      initialChildren={childrenData}
      initialSelectedChild={selectedChild}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header currentStreak={currentStreak} subscriptionTier={subscriptionTier as any} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 pb-20 lg:pb-0">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {childrenProp}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </DashboardProvider>
  )
}
