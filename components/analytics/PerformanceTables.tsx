/**
 * Performance Tables Component
 * 
 * Sortable tables showing detailed performance metrics.
 * Supports different views: by subject, by topic, by difficulty.
 * 
 * @module components/analytics/PerformanceTables
 */
'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, BookOpen } from 'lucide-react'
import type { ChildAnalytics, SubjectPerformance, TopicPerformance, MasteryLevel, TrendDirection } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface PerformanceTablesProps {
  analytics: ChildAnalytics | null
  view: 'subject' | 'topic' | 'difficulty'
}

type SortDirection = 'asc' | 'desc' | null
type SortField = 'name' | 'questions' | 'accuracy' | 'time' | 'mastery'

/**
 * Get mastery badge styling
 */
function getMasteryBadge(level: MasteryLevel) {
  switch (level) {
    case 'mastered':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Mastered</Badge>
    case 'proficient':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Proficient</Badge>
    case 'developing':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Developing</Badge>
    case 'needs_practice':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Needs Practice</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

/**
 * Get trend icon
 */
function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />
    default:
      return <Minus className="h-4 w-4 text-slate-400" />
  }
}

/**
 * Format time in seconds to readable format
 */
function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

/**
 * Subject Performance Table
 */
function SubjectTable({ data }: { data: SubjectPerformance[] }) {
  const [sortField, setSortField] = useState<SortField>('accuracy')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedData = useMemo(() => {
    if (!sortDirection) return data

    return [...data].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortField) {
        case 'name':
          aVal = a.subjectLabel
          bVal = b.subjectLabel
          break
        case 'questions':
          aVal = a.totalQuestions
          bVal = b.totalQuestions
          break
        case 'accuracy':
          aVal = a.accuracy
          bVal = b.accuracy
          break
        case 'time':
          aVal = a.averageTimeSeconds
          bVal = b.averageTimeSeconds
          break
        default:
          return 0
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal
    })
  }, [data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="gap-1 -ml-3"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : 
        sortDirection === 'desc' ? <ArrowDown className="h-3 w-3" /> :
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortButton field="name">Subject</SortButton></TableHead>
          <TableHead className="text-right"><SortButton field="questions">Questions</SortButton></TableHead>
          <TableHead className="text-right"><SortButton field="accuracy">Accuracy</SortButton></TableHead>
          <TableHead className="text-right"><SortButton field="time">Avg Time</SortButton></TableHead>
          <TableHead>Trend</TableHead>
          <TableHead>Mastery</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((subject) => (
          <TableRow key={subject.subject}>
            <TableCell className="font-medium">{subject.subjectLabel}</TableCell>
            <TableCell className="text-right">{subject.totalQuestions}</TableCell>
            <TableCell className="text-right">
              <span className={cn(
                'font-semibold',
                subject.accuracy >= 80 ? 'text-green-600' :
                subject.accuracy >= 60 ? 'text-amber-600' : 'text-red-600'
              )}>
                {subject.accuracy.toFixed(0)}%
              </span>
            </TableCell>
            <TableCell className="text-right text-slate-600">
              {formatTime(subject.averageTimeSeconds)}
            </TableCell>
            <TableCell>{getTrendIcon(subject.trend)}</TableCell>
            <TableCell>{getMasteryBadge(subject.masteryLevel)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Topic Performance Table
 */
function TopicTable({ data }: { data: TopicPerformance[] }) {
  const [sortField, setSortField] = useState<SortField>('accuracy')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc') // Show weakest first

  const sortedData = useMemo(() => {
    if (!sortDirection) return data

    return [...data].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortField) {
        case 'name':
          aVal = a.topic
          bVal = b.topic
          break
        case 'questions':
          aVal = a.totalQuestions
          bVal = b.totalQuestions
          break
        case 'accuracy':
          aVal = a.accuracy
          bVal = b.accuracy
          break
        case 'time':
          aVal = a.averageTimeSeconds
          bVal = b.averageTimeSeconds
          break
        default:
          return 0
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal
    })
  }, [data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="gap-1 -ml-3"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : 
        sortDirection === 'desc' ? <ArrowDown className="h-3 w-3" /> :
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  )

  // Get subject icon
  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'verbal_reasoning': return '🧠'
      case 'english': return '📚'
      case 'mathematics': return '🔢'
      default: return '📖'
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortButton field="name">Topic</SortButton></TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="text-right"><SortButton field="questions">Questions</SortButton></TableHead>
          <TableHead className="text-right"><SortButton field="accuracy">Accuracy</SortButton></TableHead>
          <TableHead>Trend</TableHead>
          <TableHead>Mastery</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.slice(0, 15).map((topic, index) => (
          <TableRow key={`${topic.subject}-${topic.topic}-${index}`}>
            <TableCell className="font-medium">{topic.topic}</TableCell>
            <TableCell>
              <span className="flex items-center gap-1">
                {getSubjectIcon(topic.subject as string)}
                <span className="text-slate-600 text-sm">{topic.subjectLabel}</span>
              </span>
            </TableCell>
            <TableCell className="text-right">{topic.totalQuestions}</TableCell>
            <TableCell className="text-right">
              <span className={cn(
                'font-semibold',
                topic.accuracy >= 80 ? 'text-green-600' :
                topic.accuracy >= 60 ? 'text-amber-600' : 'text-red-600'
              )}>
                {topic.accuracy.toFixed(0)}%
              </span>
            </TableCell>
            <TableCell>{getTrendIcon(topic.trend)}</TableCell>
            <TableCell>{getMasteryBadge(topic.masteryLevel)}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <a href={`/practice?topic=${encodeURIComponent(topic.topic)}`}>
                  <BookOpen className="h-3 w-3" />
                  Practice
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Difficulty Distribution Table
 */
function DifficultyTable({ analytics }: { analytics: ChildAnalytics }) {
  // Aggregate difficulty data from topic breakdowns
  const difficultyData = useMemo(() => {
    const totals = {
      foundation: { questions: 0, correct: 0 },
      standard: { questions: 0, correct: 0 },
      challenge: { questions: 0, correct: 0 }
    }

    analytics.topicBreakdown.forEach(topic => {
      const dist = topic.difficultyDistribution
      // Simplified - in real implementation would need actual correct counts per difficulty
      totals.foundation.questions += dist.foundation
      totals.standard.questions += dist.standard
      totals.challenge.questions += dist.challenge
    })

    // Calculate estimated accuracy based on overall
    const overallAccuracy = analytics.summary.overallAccuracy / 100

    return [
      {
        level: 'Foundation',
        description: 'Entry-level questions',
        questions: totals.foundation.questions,
        estimatedAccuracy: Math.min(100, overallAccuracy * 100 + 10),
        color: 'bg-green-100 text-green-700'
      },
      {
        level: 'Standard',
        description: 'Exam-level difficulty',
        questions: totals.standard.questions,
        estimatedAccuracy: overallAccuracy * 100,
        color: 'bg-blue-100 text-blue-700'
      },
      {
        level: 'Challenge',
        description: 'Above exam level',
        questions: totals.challenge.questions,
        estimatedAccuracy: Math.max(0, overallAccuracy * 100 - 15),
        color: 'bg-purple-100 text-purple-700'
      }
    ]
  }, [analytics])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Difficulty Level</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Questions Attempted</TableHead>
          <TableHead className="text-right">Est. Accuracy</TableHead>
          <TableHead>Distribution</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {difficultyData.map((difficulty) => {
          const totalQuestions = difficultyData.reduce((sum, d) => sum + d.questions, 0)
          const percentage = totalQuestions > 0 ? (difficulty.questions / totalQuestions * 100) : 0
          
          return (
            <TableRow key={difficulty.level}>
              <TableCell>
                <Badge className={difficulty.color}>{difficulty.level}</Badge>
              </TableCell>
              <TableCell className="text-slate-600">{difficulty.description}</TableCell>
              <TableCell className="text-right">{difficulty.questions}</TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  'font-semibold',
                  difficulty.estimatedAccuracy >= 80 ? 'text-green-600' :
                  difficulty.estimatedAccuracy >= 60 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {difficulty.estimatedAccuracy.toFixed(0)}%
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">{percentage.toFixed(0)}%</span>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/**
 * Loading skeleton for tables
 */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

/**
 * Performance Tables
 * 
 * Displays sortable performance data in tabular format.
 */
export function PerformanceTables({ analytics, view }: PerformanceTablesProps) {
  if (!analytics) {
    return <TableSkeleton />
  }

  switch (view) {
    case 'subject':
      return <SubjectTable data={analytics.subjectBreakdown} />
    case 'topic':
      return <TopicTable data={analytics.topicBreakdown} />
    case 'difficulty':
      return <DifficultyTable analytics={analytics} />
    default:
      return <SubjectTable data={analytics.subjectBreakdown} />
  }
}

export default PerformanceTables
