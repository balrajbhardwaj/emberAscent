/**
 * Analytics Dashboard v2 - Page Route
 * 
 * Standalone route for testing the new "Storytelling" analytics layout.
 * This page exists in parallel with the existing analytics page for A/B testing.
 * 
 * Features:
 * - Auth check with redirect to login if not authenticated
 * - Child selector support
 * - Premium tier gating (shows preview for free users)
 * - Renders AnalyticsDashboard2 component for premium users
 * 
 * @module app/(dashboard)/analytics2/page
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsDashboard2 } from "@/components/analytics/AnalyticsDashboard2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Lock, Sparkles, TrendingUp, Target, Zap } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Analytics Dashboard v2 | Ember Ascent",
  description: "Track your child's 11+ exam preparation progress with our storytelling analytics layout",
}

/**
 * Analytics Preview for Free Users
 * 
 * Shows a teaser of analytics capabilities to encourage upgrade.
 */
function AnalyticsPreview() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Unlock Powerful Analytics
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Upgrade to Ascent to get detailed insights into your child's learning journey,
          identify weaknesses, and get personalized recommendations.
        </p>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 to-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Readiness Score
            </CardTitle>
            <CardDescription>
              Know exactly how prepared your child is for their exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-300">72%</div>
            <p className="text-sm text-slate-400 mt-2">Based on accuracy, coverage, and consistency</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 to-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Weakness Heatmap
            </CardTitle>
            <CardDescription>
              Visual breakdown of performance by topic and difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded ${
                    i % 3 === 0 ? "bg-emerald-200" : i % 3 === 1 ? "bg-amber-200" : "bg-red-200"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 to-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Study Recommendations
            </CardTitle>
            <CardDescription>
              Personalized action plan based on your child's progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Upgrade to Ascent
                </h3>
                <p className="text-slate-600">
                  Get full access to analytics, insights, and personalized recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                £4.99/month
              </Badge>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/settings?tab=subscription">
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included in Ascent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Exam Readiness Score",
              "Weakness Heatmap",
              "Performance by Subject & Topic",
              "Learning Velocity Trends",
              "Risk Indicators (Rush Factor, Fatigue)",
              "Personalized Study Plans",
              "Anonymous Benchmarking",
              "Weekly Progress Reports",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Empty State when no child is selected
 */
function NoChildSelected() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <BarChart3 className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No Child Selected
        </h2>
        <p className="text-slate-600 mb-6 max-w-sm mx-auto">
          Select a child from the dropdown in the header to view their analytics.
        </p>
        <Button asChild variant="outline">
          <Link href="/settings">
            Manage Children
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Main Analytics2 Page Component
 */
export default async function Analytics2Page({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/analytics2")
  }

  // Get user profile with subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single()

  // Get user's children
  const { data: children } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })

  const isPremium = profile?.subscription_tier === "ascent" || profile?.subscription_tier === "summit"

  // Determine which child to show
  const params = await searchParams
  const selectedChildId = params.child || children?.[0]?.id
  const selectedChild = children?.find((c) => c.id === selectedChildId)

  return (
    <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Render based on state */}
      {!children || children.length === 0 ? (
        <NoChildSelected />
      ) : !selectedChild ? (
        <NoChildSelected />
      ) : !isPremium ? (
        <AnalyticsPreview />
      ) : (
        <AnalyticsDashboard2
          childId={selectedChild.id}
          childName={selectedChild.name}
        />
      )}
    </div>
  )
}
