/**
 * Subject Card Component
 * 
 * Displays a subject (Verbal Reasoning, English, Maths) with:
 * - Subject icon and name
 * - Progress bar showing mastery percentage
 * - Button to continue or start practicing
 * 
 * Clicking the card opens topic selection for that subject.
 * 
 * @module components/practice/SubjectCard
 */
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SubjectCardProps {
  subject: string
  icon: string
  progress: number
  topicsMastered: number
  totalTopics: number
  color: string
  onClick: () => void
}

/**
 * Subject Card
 * 
 * Shows a subject with progress tracking and action button.
 * 
 * @param subject - Subject name (e.g., "Verbal Reasoning")
 * @param icon - Emoji icon for the subject
 * @param progress - Progress percentage (0-100)
 * @param topicsMastered - Number of topics mastered
 * @param totalTopics - Total number of topics in subject
 * @param color - Tailwind color class for progress bar
 * @param onClick - Handler when card or button is clicked
 */
export function SubjectCard({
  subject,
  icon,
  progress,
  topicsMastered,
  totalTopics,
  color,
  onClick,
}: SubjectCardProps) {
  const hasStarted = progress > 0

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Icon & Title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{subject}</h3>
            <p className="text-sm text-slate-600">
              {topicsMastered} of {totalTopics} topics
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 space-y-2">
          <Progress value={progress} className={`h-2 ${color}`} />
          <p className="text-xs text-slate-500">{progress}% complete</p>
        </div>

        {/* Action Button */}
        <Button
          variant={hasStarted ? "default" : "outline"}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {hasStarted ? "Continue" : "Start"}
        </Button>
      </div>
    </Card>
  )
}
