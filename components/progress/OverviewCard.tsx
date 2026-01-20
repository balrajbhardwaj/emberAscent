/**
 * Overview Card Component
 * 
 * Displays a single stat card with icon, value, and label.
 * Used in the top row of the Progress dashboard.
 * 
 * @module components/progress/OverviewCard
 */
"use client"

import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtext?: string
  color: "blue" | "orange" | "green" | "purple"
  isLoading?: boolean
}

const COLOR_CLASSES = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    gradient: "from-green-50 to-green-100",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
  },
}

/**
 * Overview Card
 * 
 * Stat card showing a key metric with icon and label.
 * 
 * @param icon - Lucide icon component
 * @param label - Card label
 * @param value - Main value to display
 * @param subtext - Optional subtext below value
 * @param color - Color theme
 * @param isLoading - Loading state
 */
export function OverviewCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  isLoading = false,
}: OverviewCardProps) {
  const colors = COLOR_CLASSES[color]

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 bg-gradient-to-br ${colors.gradient} border-2 transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-7 w-7 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </Card>
  )
}
