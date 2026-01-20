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

import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  bgColor: string
  onClick: () => void
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
  icon: Icon,
  iconColor,
  bgColor,
  onClick,
}: QuickActionCardProps) {
  return (
    <Card
      className={`group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${bgColor}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-6">
        {/* Icon */}
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/90 ${iconColor} shadow-sm`}>
          <Icon className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>

        {/* Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden group-hover:flex sm:flex"
        >
          Start →
        </Button>
      </div>
    </Card>
  )
}
