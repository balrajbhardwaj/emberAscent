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
      className="group cursor-pointer border border-slate-100 bg-white transition-all hover:border-slate-200 hover:shadow-sm"
      onClick={onClick}
    >
      <div className="p-5">
        {/* Icon & Title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50/80 text-xl">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-800">{subject}</h3>
            <p className="text-sm text-slate-500">
              {topicsMastered} of {totalTopics} topics
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <Progress value={progress} className={`h-1.5 ${color}`} />
          <p className="text-xs text-slate-400">{progress}% complete</p>
        </div>

        {/* Action Button */}
        <Button
          variant="ghost"
          className="w-full border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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
