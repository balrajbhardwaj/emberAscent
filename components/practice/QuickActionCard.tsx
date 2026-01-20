/**
 * Quick Action Card Component
 * 
 * Large, tappable card for starting different practice modes:
 * - Quick Practice: 10 questions, mixed topics
 * - Focus Session: 25 questions, choose subject
 * - Mock Test: Timed exam simulation
 * 
 * @module components/practice/QuickActionCard
 */
"use client"

import { Zap, Target, Clock, LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface QuickActionCardProps {
  title: string
  description: string
  icon: string // Changed to string
  iconColor: string
  bgColor: string
  onClick: () => void
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'zap': Zap,
  'target': Target,
  'clock': Clock,
}

/**
 * Quick Action Card
 * 
 * Large, visually prominent card for starting practice sessions.
 * Designed to be easily tappable on mobile devices.
 * 
 * @param title - Practice mode title
 * @param description - Brief description of the mode
 * @param icon - Lucide icon component to display
 * @param iconColor - Tailwind color class for the icon
 * @param bgColor - Tailwind background gradient classes
 * @param onClick - Handler when card is clicked
 */
export function QuickActionCard({
  title,
  description,
  icon,
  iconColor,
  bgColor,
  onClick,
}: QuickActionCardProps) {
  const IconComponent = iconMap[icon] || Zap // Fallback to Zap
  return (
    <Card
      className={`group cursor-pointer overflow-hidden border border-slate-100 transition-all hover:scale-[1.02] hover:shadow-md ${bgColor}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-6">
        {/* Icon */}
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 ${iconColor}`}>
          <IconComponent className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>

        {/* Arrow */}
        <span className="hidden text-sm font-medium text-slate-400 transition-colors group-hover:text-slate-600 sm:block">
          Start →
        </span>
      </div>
    </Card>
  )
}
