/**
 * Benchmarking Card Component
 * 
 * Displays anonymized percentile rankings compared to other learners.
 * Summit tier feature only.
 * 
 * @module components/analytics/BenchmarkingCard
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Users, TrendingUp, Award, Info, Crown } from 'lucide-react'
import type { BenchmarkData } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface BenchmarkingCardProps {
  childId: string
}

/**
 * Get percentile description
 */
function getPercentileDescription(percentile: number): {
  label: string
  color: string
  icon: React.ReactNode
} {
  if (percentile >= 90) {
    return {
      label: 'Excellent',
      color: 'text-green-600 bg-green-50',
      icon: <Crown className="h-4 w-4 text-amber-500" />
    }
  }
  if (percentile >= 75) {
    return {
      label: 'Great',
      color: 'text-blue-600 bg-blue-50',
      icon: <Award className="h-4 w-4 text-blue-500" />
    }
  }
  if (percentile >= 50) {
    return {
      label: 'Good',
      color: 'text-slate-600 bg-slate-50',
      icon: <TrendingUp className="h-4 w-4 text-slate-500" />
    }
  }
  return {
    label: 'Growing',
    color: 'text-amber-600 bg-amber-50',
    icon: <TrendingUp className="h-4 w-4 text-amber-500" />
  }
}

/**
 * Benchmarking Card
 * 
 * Shows how the child compares to other learners (anonymized).
 */
export function BenchmarkingCard({ childId }: BenchmarkingCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)

  useEffect(() => {
    async function fetchBenchmark() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics/benchmark?childId=${childId}`)
        if (response.ok) {
          const data = await response.json()
          setBenchmark(data)
        }
      } catch (error) {
        console.error('Error fetching benchmark:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBenchmark()
  }, [childId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compared to Others</CardTitle>
          <CardDescription>Anonymized percentile rankings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Check if child has enough data for meaningful comparison
  // Must have data AND at least one subject with practice attempts (childScore > 0)
  const hasEnoughData = benchmark && 
    benchmark.subjectPercentiles && 
    Array.isArray(benchmark.subjectPercentiles) &&
    benchmark.subjectPercentiles.length > 0 &&
    benchmark.subjectPercentiles.some(s => (s.childScore || 0) > 0)

  // If no practice data, show encouraging message
  if (!hasEnoughData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                Compared to Others
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  Summit
                </Badge>
              </CardTitle>
              <CardDescription>
                Anonymized percentile rankings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Start Practicing to See Rankings
            </h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              Complete some practice sessions to see how you compare with other learners in your year group.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = benchmark!
  const overallDesc = getPercentileDescription(data.overallPercentile)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Compared to Others
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                Summit
              </Badge>
            </CardTitle>
            <CardDescription>
              Anonymized percentile rankings
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Compared against {data.comparisonGroup.totalStudents.toLocaleString()} {data.comparisonGroup.description}. 
                  All comparisons are anonymized and aggregated.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Percentile */}
        <div className={cn(
          'p-4 rounded-lg text-center',
          overallDesc.color
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {overallDesc.icon}
            <span className="text-sm font-medium uppercase tracking-wide">
              Overall Ranking
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">
            Top {100 - data.overallPercentile}%
          </div>
          <p className="text-sm opacity-80">
            {overallDesc.label} performance
          </p>
        </div>

        {/* Subject Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700">By Subject</h4>
          
          {data.subjectPercentiles.map((subject) => {
            const subjectLabels: Record<string, { label: string; icon: string }> = {
              verbal_reasoning: { label: 'Verbal Reasoning', icon: '🧠' },
              english: { label: 'English', icon: '📚' },
              mathematics: { label: 'Mathematics', icon: '🔢' }
            }
            const info = subjectLabels[subject.subject as string] || { 
              label: subject.subject, 
              icon: '📖' 
            }
            // Percentile description available via getPercentileDescription if needed

            return (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {info.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    Top {100 - subject.percentile}%
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={subject.percentile} 
                    className="h-2 bg-slate-200"
                  />
                  {/* Marker for average */}
                  <div 
                    className="absolute top-0 w-0.5 h-2 bg-slate-500"
                    style={{ left: '50%' }}
                    title="Average"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Your score: {subject.childScore}%</span>
                  <span>Average: {subject.averageScore}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center">
          Based on {data.comparisonGroup.totalStudents.toLocaleString()} learners · Updated weekly
        </p>
      </CardContent>
    </Card>
  )
}

export default BenchmarkingCard
