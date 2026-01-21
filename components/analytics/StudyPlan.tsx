/**
 * Study Plan Display Component
 * 
 * Shows the weekly study plan with daily activities,
 * progress tracking, and quick-start options.
 * 
 * @module components/analytics/StudyPlan
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Calendar,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import type { StudyPlan, PlannedActivity } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface StudyPlanProps {
  childId: string
  onActivityStart?: (activity: PlannedActivity) => void
}

/**
 * Study Plan Component
 * 
 * Displays the weekly study plan with calendar view.
 */
export function StudyPlanDisplay({ childId, onActivityStart }: StudyPlanProps) {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Fetch study plan
  useEffect(() => {
    async function fetchPlan() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics/study-plan?childId=${childId}`)
        if (response.ok) {
          const data = await response.json()
          setPlan(data)
          
          // Auto-expand today
          const today = new Date().toISOString().split('T')[0]
          setExpandedDays(new Set([today]))
        }
      } catch (error) {
        console.error('Error fetching study plan:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [childId])

  // Toggle day expansion
  const toggleDay = (dateString: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(dateString)) {
        next.delete(dateString)
      } else {
        next.add(dateString)
      }
      return next
    })
  }

  // Check if a day is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Calculate progress
  const calculateProgress = () => {
    if (!plan) return { completed: 0, total: 0, percentage: 0 }
    
    let completed = 0
    let total = 0
    
    plan.dailyPlans.forEach(day => {
      day.activities.forEach(activity => {
        total++
        if (activity.completed) completed++
      })
    })
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This Week&apos;s Plan</CardTitle>
          <CardDescription>Your personalized study schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This Week&apos;s Plan</CardTitle>
          <CardDescription>Your personalized study schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No study plan available yet.</p>
            <p className="text-slate-500 text-sm mt-1">
              Complete some practice sessions to generate your plan.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progress = calculateProgress()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              This Week&apos;s Plan
            </CardTitle>
            <CardDescription>
              {new Date(plan.weekStart).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short' 
              })} - {new Date(plan.weekEnd).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Weekly Progress</span>
            <span className="text-sm text-slate-600">
              {progress.completed} of {progress.total} activities
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{plan.estimatedTotalMinutes} min total
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {plan.weeklyFocusAreas.length} focus areas
            </span>
          </div>
        </div>

        {/* Daily Plans */}
        <div className="space-y-3">
          {plan.dailyPlans.map((day) => {
            const dateString = new Date(day.date).toISOString().split('T')[0]
            const isExpanded = expandedDays.has(dateString)
            const dayIsToday = isToday(new Date(day.date))
            const completedActivities = day.activities.filter(a => a.completed).length
            const allComplete = completedActivities === day.activities.length && day.activities.length > 0

            return (
              <Collapsible
                key={dateString}
                open={isExpanded}
                onOpenChange={() => toggleDay(dateString)}
              >
                <div className={cn(
                  'rounded-lg border transition-colors',
                  dayIsToday ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200',
                  allComplete && 'border-green-200 bg-green-50/50'
                )}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold',
                        dayIsToday 
                          ? 'bg-orange-100 text-orange-700'
                          : allComplete
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      )}>
                        {new Date(day.date).getDate()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {day.dayOfWeek}
                          </span>
                          {dayIsToday && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              Today
                            </Badge>
                          )}
                          {allComplete && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {day.activities.length} activities · ~{day.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {completedActivities}/{day.activities.length} done
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {day.activities.map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          onStart={() => onActivityStart?.(activity)}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>

        {/* Focus Areas */}
        {plan.weeklyFocusAreas.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Focus Areas This Week
            </h4>
            <div className="flex flex-wrap gap-2">
              {plan.weeklyFocusAreas.map((area, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    area.currentAccuracy < 50 
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : area.currentAccuracy < 70
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                  )}
                >
                  {area.topic} ({area.currentAccuracy.toFixed(0)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Individual activity item
 */
function ActivityItem({ 
  activity, 
  onStart 
}: { 
  activity: PlannedActivity
  onStart?: () => void 
}) {
  const subjectIcons: Record<string, string> = {
    verbal_reasoning: '🧠',
    english: '📚',
    mathematics: '🔢'
  }

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-green-600'
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
      activity.completed 
        ? 'bg-slate-50 border-slate-200' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    )}>
      {/* Checkbox */}
      <Checkbox
        checked={activity.completed}
        className="data-[state=checked]:bg-green-500"
      />

      {/* Subject icon */}
      <span className="text-xl">
        {subjectIcons[activity.subject as string] || '📖'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium',
            activity.completed ? 'text-slate-500 line-through' : 'text-slate-900'
          )}>
            {activity.topic}
          </span>
          <span className={cn(
            'text-xs font-medium',
            priorityColors[activity.priority]
          )}>
            {activity.priority === 'high' && '●'}
            {activity.priority === 'medium' && '○'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{activity.questionCount} questions</span>
          <span>~{activity.estimatedMinutes} min</span>
          <Badge variant="secondary" className="text-xs">
            {activity.difficulty}
          </Badge>
        </div>
      </div>

      {/* Action */}
      {!activity.completed && (
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1 shrink-0"
          onClick={onStart}
        >
          <Play className="h-3 w-3" />
          Start
        </Button>
      )}
    </div>
  )
}

export default StudyPlanDisplay
