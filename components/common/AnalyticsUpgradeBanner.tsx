/**
 * Analytics Upgrade Banner Component
 * 
 * Subtle, non-intrusive prompt for free users to learn about analytics.
 * Displayed in progress and practice pages.
 * 
 * @module components/common/AnalyticsUpgradeBanner
 */

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AnalyticsUpgradeBannerProps {
  message: string
  insight: string
}

/**
 * Subtle banner promoting analytics features
 * Server component - no client-side state
 */
export function AnalyticsUpgradeBanner({ message, insight }: AnalyticsUpgradeBannerProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-4 px-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 mb-1">
              💡 {message}
            </p>
            <p className="text-sm text-slate-600 mb-3">
              {insight}
            </p>
            <Link
              href="/pricing"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              See what's included →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
