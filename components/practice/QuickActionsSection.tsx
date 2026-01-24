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
  subscriptionTier?: string
}

/**
 * Quick Actions Section
 *
 * Renders the three main practice mode cards with proper navigation handlers.
 * Mock Test card is locked for free users.
 *
 * @param childId - The selected child's ID for routing
 * @param subscriptionTier - User's subscription tier
 */
export function QuickActionsSection({ childId, subscriptionTier }: QuickActionsSectionProps) {
  const router = useRouter()
  
  const isAscent = subscriptionTier === 'ascent' || subscriptionTier === 'summit'

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
        description={isAscent ? "Timed exam simulation" : "🔒 Ascent Feature"}
        icon="clock"
        iconColor={isAscent ? "text-violet-500" : "text-slate-400"}
        bgColor={isAscent ? "bg-violet-50/60" : "bg-slate-100/60"}
        onClick={() => {
          if (isAscent) {
            router.push(`/practice/mock?childId=${childId}`)
          } else {
            router.push('/pricing?feature=mock-tests')
          }
        }}
      />
    </div>
  )
}
