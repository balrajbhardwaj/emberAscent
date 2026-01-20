/**
 * Weak Areas Card Component
 * 
 * Displays topics that need focus (accuracy <60%).
 * Shows top 3 weakest areas with accuracy and action buttons.
 * 
 * @module components/progress/WeakAreasCard
 */
"use client"

import { AlertTriangle, Target, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface WeakTopic {
  topic: string
  subject: string
  accuracy: number
  questionsAttempted: number
}

interface WeakAreasCardProps {
  weakTopics: WeakTopic[]
  isLoading?: boolean
}

/**
 * Weak Topic Item
 */
function WeakTopicItem({ topic }: { topic: WeakTopic }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
        <TrendingDown className="h-5 w-5 text-red-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 truncate">{topic.topic}</h4>
          <Badge variant="outline" className="text-xs shrink-0">
            {topic.subject}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {topic.questionsAttempted} questions • {topic.accuracy}% accuracy
            </span>
          </div>
          <Progress value={topic.accuracy} className="h-1.5" />
        </div>
      </div>

      {/* Action button */}
      <Button size="sm" asChild>
        <Link href={`/practice/focus?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`}>
          Practice
        </Link>
      </Button>
    </div>
  )
}

/**
 * Weak Areas Card
 * 
 * Shows topics needing focus with practice buttons.
 * 
 * @param weakTopics - Array of weak topics
 * @param isLoading - Loading state
 */
export function WeakAreasCard({ weakTopics, isLoading = false }: WeakAreasCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // No weak areas - show encouragement
  if (weakTopics.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-green-100">
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              Great Job! 🎉
            </h3>
            <p className="text-sm text-green-700">
              You don't have any weak areas right now. Keep up the excellent work!
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/practice">
              Continue Practicing
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              Areas Needing Focus
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              These topics need more practice to improve your mastery
            </p>
          </div>
        </div>

        {/* Weak topics list */}
        <div className="space-y-3">
          {weakTopics.map((topic) => (
            <WeakTopicItem key={`${topic.subject}-${topic.topic}`} topic={topic} />
          ))}
        </div>

        {/* Footer message */}
        <div className="pt-4 border-t border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>💡 Tip:</strong> Focus on one weak area at a time for better results. 
            Aim for 70% accuracy before moving to the next topic.
          </p>
        </div>
      </div>
    </Card>
  )
}
