/**
 * Study Recommendations Component
 * 
 * Displays AI-generated study recommendations based on
 * child's performance patterns.
 * 
 * Features:
 * - Priority-based action items
 * - Direct session creation from recommendations (no manual config)
 * - Focus areas with progress targets
 * 
 * @module components/analytics/StudyRecommendations
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Lightbulb, 
  Target, 
  Clock, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ChildAnalytics, FocusArea } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface StudyRecommendationsProps {
  childId: string
  analytics: ChildAnalytics | null
}

interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  subject: string
  topics: string[]
  estimatedMinutes: number
  difficulty?: 'foundation' | 'standard' | 'challenge'
  actionUrl: string
}

/**
 * Study Recommendations
 * 
 * Shows personalized study recommendations based on performance.
 */
export function StudyRecommendations({ childId, analytics }: StudyRecommendationsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [showAll, setShowAll] = useState(false)
  const [creatingSessionId, setCreatingSessionId] = useState<string | null>(null)

  /**
   * Create a practice session directly from a recommendation
   * Bypasses manual configuration - user goes straight to practicing
   */
  const handleStartFromRecommendation = useCallback(async (rec: Recommendation) => {
    if (creatingSessionId) return // Prevent double-click
    
    setCreatingSessionId(rec.id)
    
    try {
      const response = await fetch('/api/practice/session/from-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          recommendation: {
            subject: rec.subject,
            topics: rec.topics,
            difficulty: rec.difficulty,
            estimatedMinutes: rec.estimatedMinutes
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create session')
      }

      const { sessionId, redirect } = await response.json()
      
      toast({
        title: 'Practice Session Ready!',
        description: `Starting ${rec.title} with ${rec.topics.length > 0 ? rec.topics.join(', ') : 'mixed topics'}`,
      })

      // Navigate directly to the practice session
      router.push(redirect || `/practice/session/${sessionId}`)
      
    } catch (error) {
      console.error('Failed to create session from recommendation:', error)
      toast({
        title: 'Could not start practice',
        description: error instanceof Error ? error.message : 'Please try again or use manual practice selection.',
        variant: 'destructive'
      })
    } finally {
      setCreatingSessionId(null)
    }
  }, [childId, creatingSessionId, router, toast])

  // Generate recommendations from analytics
  useEffect(() => {
    if (!analytics) {
      setIsLoading(true)
      return
    }

    // Analyze performance and generate recommendations
    const recs: Recommendation[] = []
    const areas: FocusArea[] = []

    // Find weak topics
    const weakTopics = analytics.topicBreakdown
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)

    // Group weak topics by subject
    const weakBySubject = weakTopics.reduce((acc, topic) => {
      const subject = topic.subject as string
      if (!acc[subject]) acc[subject] = []
      acc[subject].push(topic)
      return acc
    }, {} as Record<string, typeof weakTopics>)

    // Generate subject-specific recommendations
    Object.entries(weakBySubject).forEach(([subject, topics]) => {
      if (topics.length > 0) {
        const subjectLabel = topics[0].subjectLabel
        const topicNames = topics.slice(0, 3).map(t => t.topic)
        const avgAccuracy = topics.reduce((sum, t) => sum + t.accuracy, 0) / topics.length

        // Determine difficulty based on accuracy
        const difficulty: 'foundation' | 'standard' | 'challenge' = 
          avgAccuracy < 40 ? 'foundation' : 
          avgAccuracy < 70 ? 'standard' : 'challenge'

        recs.push({
          id: `rec_${subject}`,
          title: `Improve ${subjectLabel}`,
          description: avgAccuracy < 50 
            ? `These topics need focused practice to build foundation skills.`
            : `Close to mastery! A few more practice sessions will help solidify understanding.`,
          priority: avgAccuracy < 50 ? 'high' : avgAccuracy < 65 ? 'medium' : 'low',
          subject,
          topics: topicNames,
          difficulty,
          estimatedMinutes: topics.length * 10,
          actionUrl: `/practice?subject=${subject}`
        })

        // Add to focus areas
        topics.slice(0, 2).forEach(topic => {
          areas.push({
            topic: topic.topic,
            subject: topic.subject as string,
            reason: `${topic.accuracy.toFixed(0)}% accuracy - needs improvement`,
            currentAccuracy: topic.accuracy,
            targetAccuracy: 85,
            importance: 8,
            suggestedQuestions: Math.ceil((85 - topic.accuracy) / 5) * 5,
            priority: topic.accuracy < 50 ? 'high' : topic.accuracy < 65 ? 'medium' : 'low'
          })
        })
      }
    })

    // Add consistency recommendation if needed
    if (analytics.summary.currentStreak < 3) {
      recs.push({
        id: 'rec_consistency',
        title: 'Build a Practice Streak',
        description: 'Regular practice is key to success. Try to practice a little bit every day.',
        priority: 'medium',
        subject: 'all',
        topics: ['Daily practice'],
        estimatedMinutes: 15,
        actionUrl: '/practice'
      })
    }

    // Add challenge recommendation if doing well
    const avgAccuracy = analytics.summary.overallAccuracy
    if (avgAccuracy >= 80) {
      recs.push({
        id: 'rec_challenge',
        title: 'Ready for Challenge Questions',
        description: 'Great progress! Try some harder questions to push your skills further.',
        priority: 'low',
        subject: 'all',
        topics: ['Challenge level'],
        estimatedMinutes: 20,
        actionUrl: '/practice?difficulty=challenge'
      })
    }

    setRecommendations(recs)
    setFocusAreas(areas.slice(0, 5))
    setIsLoading(false)
  }, [analytics])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions for improvement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const visibleRecommendations = showAll ? recommendations : recommendations.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Study Recommendations
            </CardTitle>
            <CardDescription>
              Personalized suggestions based on performance
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lightbulb className="h-3 w-3" />
            {recommendations.length} suggestions
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Focus Areas Summary */}
        {focusAreas.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">This Week&apos;s Focus Areas</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, i) => (
                <Badge 
                  key={i}
                  variant="secondary"
                  className="bg-white text-amber-800 border-amber-200"
                >
                  {area.topic} ({area.currentAccuracy.toFixed(0)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations List */}
        <div className="space-y-4">
          {visibleRecommendations.map((rec) => (
            <RecommendationCard 
              key={rec.id} 
              recommendation={rec}
              onStart={handleStartFromRecommendation}
              isLoading={creatingSessionId === rec.id}
            />
          ))}
        </div>

        {/* Show More/Less Button */}
        {recommendations.length > 3 && (
          <Button
            variant="ghost"
            className="w-full gap-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {recommendations.length - 3} More
              </>
            )}
          </Button>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-1">Great Progress!</h4>
            <p className="text-slate-600 text-sm">
              Keep up the good work. Practice consistently to maintain your skills.
            </p>
            <Button className="mt-4" asChild>
              <a href="/practice">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Practice
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Individual recommendation card
 */
function RecommendationCard({ 
  recommendation, 
  onStart, 
  isLoading 
}: { 
  recommendation: Recommendation
  onStart: (rec: Recommendation) => void
  isLoading: boolean
}) {
  const priorityStyles = {
    high: 'border-l-4 border-l-red-500 bg-red-50/50',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50/50',
    low: 'border-l-4 border-l-green-500 bg-green-50/50'
  }

  const priorityLabels = {
    high: { label: 'High Priority', class: 'bg-red-100 text-red-700' },
    medium: { label: 'Medium Priority', class: 'bg-amber-100 text-amber-700' },
    low: { label: 'Suggested', class: 'bg-green-100 text-green-700' }
  }

  return (
    <div className={cn(
      'p-4 rounded-lg transition-colors hover:shadow-sm',
      priorityStyles[recommendation.priority]
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900">{recommendation.title}</h4>
            <Badge className={priorityLabels[recommendation.priority].class} variant="secondary">
              {priorityLabels[recommendation.priority].label}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-600 mb-2">
            {recommendation.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{recommendation.estimatedMinutes} min
            </span>
            {recommendation.topics.length > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {recommendation.topics.join(', ')}
              </span>
            )}
          </div>
        </div>

        <Button 
          size="sm" 
          variant="outline" 
          className="shrink-0 gap-1"
          onClick={() => onStart(recommendation)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Start
              <ArrowRight className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default StudyRecommendations
