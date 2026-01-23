/**
 * Study Plan Display Component
 * 
 * Shows the weekly study plan with daily activities,
 * progress tracking, and quick-start options.
 * 
 * @module components/analytics/StudyPlan
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
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
  RefreshCw,
  Flame,
  ArrowRight
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
  const [isRefetching, setIsRefetching] = useState(false)

  // Fetch study plan
  const fetchPlan = useCallback(
    async (options?: { background?: boolean }) => {
      if (options?.background) {
        setIsRefetching(true)
      } else {
        setIsLoading(true)
      }

      try {
        const response = await fetch(`/api/analytics/study-plan?childId=${childId}`)
        if (response.ok) {
          const data = await response.json()
          setPlan(data)

          const today = new Date().toISOString().split('T')[0]
          setExpandedDays(new Set([today]))
        }
      } catch (error) {
        console.error('Error fetching study plan:', error)
      } finally {
        if (options?.background) {
          setIsRefetching(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [childId]
  )

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

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

  const weekAnchor = plan.weekOf ? new Date(plan.weekOf) : new Date(plan.weekStart)
  const calendarDays = Array.from({ length: 7 }, (_, offset) => {
    const currentDate = new Date(weekAnchor)
    currentDate.setDate(weekAnchor.getDate() + offset)
    const dayPlan = plan.dailyPlans.find(
      (day) => new Date(day.date).toDateString() === currentDate.toDateString()
    )
    const completedCount = dayPlan ? dayPlan.activities.filter((a) => a.completed).length : 0
    const totalActivities = dayPlan?.activities.length ?? 0

    return {
      date: currentDate,
      plan: dayPlan,
      completedCount,
      totalActivities,
      isRestDay: !dayPlan || totalActivities === 0,
      isToday: isToday(currentDate)
    }
  })

  const calendarRangeLabel = calendarDays.length
    ? `${calendarDays[0].date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      })} - ${calendarDays[calendarDays.length - 1].date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      })}`
    : ''

  const todayPlan = plan.dailyPlans.find((day) => isToday(new Date(day.date)))
  const nextActivity =
    todayPlan?.activities.find((activity) => !activity.completed) ?? todayPlan?.activities[0]
  const planStreak = plan.dailyPlans.filter(
    (day) => day.activities.length > 0 && day.activities.every((activity) => activity.completed)
  ).length
  const focusAreas = plan.focusAreas.slice(0, 3)

  const findActivityForTopic = (topic: string): PlannedActivity | undefined => {
    for (const dayPlan of plan.dailyPlans) {
      const match = dayPlan.activities.find((activity) => activity.topic === topic)
      if (match) return match
    }
    return undefined
  }

  const handleStartActivity = (activity?: PlannedActivity) => {
    if (!activity) return
    onActivityStart?.(activity)
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => fetchPlan({ background: true })}
              disabled={isRefetching}
            >
              <RefreshCw className={cn('h-3 w-3', isRefetching && 'animate-spin')} />
              {isRefetching ? 'Refreshing' : 'Regenerate'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => fetchPlan({ background: true })}
              disabled={isRefetching}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Adjust plan
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress overview */}
        <div className="p-4 bg-slate-50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Weekly progress</p>
              <p className="text-xs text-slate-500">
                {progress.completed} of {progress.total} activities complete
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-900">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{plan.totalRecommendedMinutes} min total
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {plan.focusAreas.length} focus areas
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {planStreak} day streak
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{plan.reasoning}</p>
        </div>

        {/* Calendar overview */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Calendar overview
            </h4>
            <span className="text-xs text-slate-500">{calendarRangeLabel}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  'rounded-xl border p-3 text-center space-y-1',
                  day.isToday && 'border-orange-300 bg-orange-50',
                  day.plan && day.totalActivities > 0 && day.completedCount === day.totalActivities && 'border-green-300 bg-green-50',
                  day.isRestDay && 'border-dashed opacity-60'
                )}
              >
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">
                  {day.date.toLocaleDateString('en-GB', { weekday: 'short' })}
                </p>
                <p className="text-lg font-semibold text-slate-900">{day.date.getDate()}</p>
                <p className="text-xs text-slate-500">
                  {day.isRestDay ? 'Rest day' : `${day.completedCount}/${day.totalActivities} done`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Daily plans */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Daily activities</h4>
              <span className="text-xs text-slate-500">
                {plan.dailyPlans.length} practice days scheduled
              </span>
            </div>
            <div className="space-y-3">
              {plan.dailyPlans.map((day) => {
                const dateString = new Date(day.date).toISOString().split('T')[0]
                const isExpanded = expandedDays.has(dateString)
                const dayIsToday = isToday(new Date(day.date))
                const completedActivities = day.activities.filter((a) => a.completed).length
                const allComplete = completedActivities === day.activities.length && day.activities.length > 0

                return (
                  <Collapsible
                    key={dateString}
                    open={isExpanded}
                    onOpenChange={() => toggleDay(dateString)}
                  >
                    <div
                      className={cn(
                        'rounded-lg border transition-colors',
                        dayIsToday ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200',
                        allComplete && 'border-green-200 bg-green-50/50'
                      )}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold',
                              dayIsToday
                                ? 'bg-orange-100 text-orange-700'
                                : allComplete
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {new Date(day.date).getDate()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{day.dayOfWeek}</span>
                              {dayIsToday && (
                                <Badge className="bg-orange-100 text-orange-700 text-xs">Today</Badge>
                              )}
                              {allComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                            <span className="text-xs text-slate-500">
                              {day.activities.length} activities · ~{day.recommendedMinutes} min
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
                              onStart={() => handleStartActivity(activity)}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )
              })}
            </div>
          </section>

          {/* Today card */}
          <section className="rounded-xl border p-4 bg-gradient-to-br from-white to-amber-50/40 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Today&apos;s recommendation</p>
                <p className="text-xs text-slate-500">
                  {todayPlan ? "Quick plan tailored for today's session" : 'No scheduled practice today'}
                </p>
              </div>
              <Badge variant="secondary">~{todayPlan?.recommendedMinutes ?? 15} min</Badge>
            </div>

            {todayPlan ? (
              <>
                <div className="space-y-2">
                  {todayPlan.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/60 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{activity.topic}</p>
                        <p className="text-xs text-slate-500">
                          {activity.questionCount} questions · ~{activity.estimatedMinutes} min
                        </p>
                      </div>
                      {activity.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gap-1"
                  onClick={() => handleStartActivity(nextActivity)}
                  disabled={!nextActivity}
                >
                  <Play className="h-4 w-4" />
                  Start next activity
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Enjoy a rest day! Tomorrow's plan will adapt once new practice data arrives.
              </p>
            )}
          </section>
        </div>

        {/* Focus areas */}
        {focusAreas.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Focus areas this week
              </h4>
              <span className="text-xs text-slate-500">Auto-selected from weakest topics</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {focusAreas.map((area) => {
                const topicActivity = findActivityForTopic(area.topic)
                const priorityClass =
                  area.priority === 'high'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : area.priority === 'medium'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-blue-200 bg-blue-50 text-blue-700'

                return (
                  <div key={area.topic} className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{area.topic}</p>
                        <p className="text-xs text-slate-500">{area.subject}</p>
                      </div>
                      <Badge variant="outline" className={priorityClass}>
                        {area.priority} focus
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{area.reason}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {area.currentAccuracy.toFixed(0)}% -&gt; {area.targetAccuracy}%
                      </span>
                      <span>{area.suggestedQuestions} Q</span>
                    </div>
                    <Button
                      size="sm"
                      variant={topicActivity ? 'secondary' : 'outline'}
                      className="gap-1"
                      disabled={!topicActivity}
                      onClick={() => handleStartActivity(topicActivity)}
                    >
                      <ArrowRight className="h-3 w-3" />
                      Start practice
                    </Button>
                  </div>
                )
              })}
            </div>
          </section>
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
