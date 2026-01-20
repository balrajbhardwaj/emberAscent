/**
 * Quick Actions Section Component
 *
 * Client component wrapper that renders QuickActionCards with navigation.
 * Handles the onClick events that cannot be passed from server components.
 *
 * @module components/practice/QuickActionsSection
 */
"use client"

import { useRouter } from "next/navigation"
import { QuickActionCard } from "./QuickActionCard"

interface QuickActionsSectionProps {
  childId: string
}

/**
 * Quick Actions Section
 *
 * Renders the three main practice mode cards with proper navigation handlers.
 *
 * @param childId - The selected child's ID for routing
 */
export function QuickActionsSection({ childId }: QuickActionsSectionProps) {
  const router = useRouter()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <QuickActionCard
        title="Quick Practice"
        description="10 questions, mixed topics"
        icon="zap"
        iconColor="text-amber-500"
        bgColor="bg-amber-50/60"
        onClick={() => router.push(`/practice/session/start?childId=${childId}&mode=quick`)}
      />
      <QuickActionCard
        title="Focus Session"
        description="25 questions, choose subject"
        icon="target"
        iconColor="text-sky-500"
        bgColor="bg-sky-50/60"
        onClick={() => router.push(`/practice/session/start?childId=${childId}&mode=focus`)}
      />
      <QuickActionCard
        title="Mock Test"
        description="Timed exam simulation"
        icon="clock"
        iconColor="text-violet-500"
        bgColor="bg-violet-50/60"
        onClick={() => router.push(`/practice/session/start?childId=${childId}&mode=mock`)}
      />
    </div>
  )
}
