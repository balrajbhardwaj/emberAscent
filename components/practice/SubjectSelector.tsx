/**
 * Subject Selector Component
 * 
 * Grid of subject cards for Focus Session selection.
 * Shows mastery percentage and topic counts for each subject.
 * 
 * @module components/practice/SubjectSelector
 */
"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectOption {
  id: string
  name: string
  color: string
  icon: string
  topicsCount: number
  mastery: number
}

interface SubjectSelectorProps {
  subjects: SubjectOption[]
  selectedSubject: string | null
  onSelectSubject: (subjectId: string) => void
}

const COLOR_CLASSES = {
  purple: {
    card: "border-purple-200 hover:border-purple-300",
    selectedCard: "border-purple-500 bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    selectedIcon: "bg-purple-500 text-white",
    badge: "bg-purple-100 text-purple-700",
  },
  blue: {
    card: "border-blue-200 hover:border-blue-300",
    selectedCard: "border-blue-500 bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    selectedIcon: "bg-blue-500 text-white",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    card: "border-green-200 hover:border-green-300",
    selectedCard: "border-green-500 bg-green-50",
    icon: "bg-green-100 text-green-600",
    selectedIcon: "bg-green-500 text-white",
    badge: "bg-green-100 text-green-700",
  },
}

/**
 * Subject Selector
 * 
 * Interactive grid of subject cards for selection.
 * 
 * @param subjects - Array of available subjects with metadata
 * @param selectedSubject - Currently selected subject ID
 * @param onSelectSubject - Handler when subject is selected
 */
export function SubjectSelector({
  subjects,
  selectedSubject,
  onSelectSubject,
}: SubjectSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Choose a Subject</h2>
        <p className="text-sm text-slate-600">
          Select the subject you'd like to practice
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {subjects.map((subject) => {
          const isSelected = selectedSubject === subject.id
          const colors = COLOR_CLASSES[subject.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.purple

          return (
            <Card
              key={subject.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                isSelected ? colors.selectedCard : colors.card
              )}
              onClick={() => onSelectSubject(subject.id)}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors",
                      isSelected ? colors.selectedIcon : colors.icon
                    )}
                  >
                    {subject.icon}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Subject Name */}
                <div>
                  <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{subject.topicsCount} topics</span>
                  </div>
                </div>

                {/* Mastery Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Mastery</span>
                    <span className="font-semibold text-slate-900">
                      {subject.mastery}%
                    </span>
                  </div>
                  <Progress value={subject.mastery} className="h-2" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
