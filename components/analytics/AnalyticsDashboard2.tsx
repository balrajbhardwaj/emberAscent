/**
 * Analytics Dashboard - Learning Journey
 * 
 * A comprehensive analytics dashboard that presents data in a clear,
 * actionable format to help parents support their child's exam preparation.
 * 
 * Layout Sections:
 * 1. Header: Title, Date Range, Refresh, Help
 * 2. Executive Summary: High-level KPIs at a glance
 * 3. Learning Health Check: Practice habit optimization
 * 4. Deep Dive: Readiness Score + Areas of Improvement
 * 5. Details: Tabbed performance tables
 * 6. Action Plan: Recommendations + Benchmarking
 * 
 * @module components/analytics/AnalyticsDashboard2
 */
"use client"

import React, { useState, useEffect } from "react"
import {
  RefreshCw,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Award,
  BookOpen,
  BarChart3,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// New components for v2
import { AnalyticsHelp } from "./AnalyticsHelp"

// Reuse existing components where possible
// Note: These would be imported from existing files
// import { WeaknessHeatmap } from "./WeaknessHeatmap"
// import { ReadinessScore } from "./ReadinessScore"
// import { PerformanceTables } from "./PerformanceTables"
// import { StudyRecommendations } from "./StudyRecommendations"
// import { BenchmarkingCard } from "./BenchmarkingCard"

/**
 * Utility function to format subject names from snake_case to Title Case
 */
const formatSubjectName = (subject: string): string => {
  return subject
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

interface AnalyticsDashboard2Props {
  childId: string
  childName: string
}

/**
 * KPI Card Component for Executive Summary
 */
function KPICard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  color,
}: {
  icon: React.ElementType
  title: string
  value: string | number
  subtitle: string
  trend?: number
  trendLabel?: string
  color: string
}) {
  const isPositive = trend && trend > 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              <TrendingUp className={`h-4 w-4 ${!isPositive && "rotate-180"}`} />
              <span>{isPositive ? "+" : ""}{trend}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-700 mt-1">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {trendLabel && (
          <p className="text-xs text-slate-500 mt-2">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Section Header Component
 */
function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-600" />
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/**
 * Mock Readiness Score Component (placeholder until real component is available)
 */
function ReadinessScoreCard({ score, breakdown }: { score: number; breakdown: any }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-600"
    if (s >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Exam Readiness</CardTitle>
        <CardDescription>Overall preparation status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <Badge variant="secondary" className="mt-2">
            {score >= 80 ? "Ready" : score >= 60 ? "Almost Ready" : "Needs Work"}
          </Badge>
        </div>

        <div className="space-y-3 mt-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Accuracy</span>
              <span className="font-medium">{breakdown.accuracy}%</span>
            </div>
            <Progress value={breakdown.accuracy} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Topic Coverage</span>
              <span className="font-medium">{breakdown.coverage}%</span>
            </div>
            <Progress value={breakdown.coverage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Consistency</span>
              <span className="font-medium">{breakdown.consistency}%</span>
            </div>
            <Progress value={breakdown.consistency} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Learning Health Check Card - Simplified inline version
 * Shows KRI metrics: Rush Factor, Fatigue Drop-off, Stagnant Topics
 */
function LearningHealthCheckCard({ 
  rushFactor, 
  fatigueDropOff, 
  stagnantTopics 
}: { 
  rushFactor: number
  fatigueDropOff: number
  stagnantTopics: number
}) {
  // Determine risk level for each metric
  const getRiskLevel = (value: number) => {
    if (value < 5) return { level: 'healthy', color: 'text-emerald-600', bg: 'bg-emerald-50', barBg: 'bg-emerald-500', label: 'Healthy' }
    if (value <= 15) return { level: 'warning', color: 'text-amber-600', bg: 'bg-amber-50', barBg: 'bg-amber-500', label: 'Needs Attention' }
    return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50', barBg: 'bg-red-500', label: 'Critical' }
  }

  const rushRisk = getRiskLevel(rushFactor)
  const fatigueRisk = getRiskLevel(fatigueDropOff)
  const stagnantRisk = getRiskLevel(stagnantTopics)

  const isAllHealthy = rushRisk.level === 'healthy' && fatigueRisk.level === 'healthy' && stagnantRisk.level === 'healthy'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-base">
            Build strong practice habits to maximize exam readiness
          </CardDescription>
          {isAllHealthy && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              All Clear
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rush Factor */}
        <div className={`rounded-lg border p-4 ${rushRisk.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Zap className={`h-5 w-5 ${rushRisk.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Rush Factor</h4>
                <p className="text-xs text-slate-500">Questions answered in under 10 seconds</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${rushRisk.color}`}>{rushFactor}%</div>
              <Badge variant="secondary" className={`text-xs ${rushRisk.bg} ${rushRisk.color}`}>
                {rushRisk.label}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>0%</span>
              <span>5%</span>
              <span>15%</span>
              <span>25%+</span>
            </div>
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              {/* @ts-expect-error Dynamic width requires inline style */}
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${rushRisk.barBg}`} 
                style={{ width: `${Math.min(100, (rushFactor / 25) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fatigue Drop-off */}
        <div className={`rounded-lg border p-4 ${fatigueRisk.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <TrendingUp className={`h-5 w-5 ${fatigueRisk.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Fatigue Drop-off</h4>
                <p className="text-xs text-slate-500">Accuracy decline during sessions</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${fatigueRisk.color}`}>{fatigueDropOff}%</div>
              <Badge variant="secondary" className={`text-xs ${fatigueRisk.bg} ${fatigueRisk.color}`}>
                {fatigueRisk.label}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>0%</span>
              <span>5%</span>
              <span>15%</span>
              <span>25%+</span>
            </div>
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              {/* @ts-expect-error Dynamic width requires inline style */}
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${fatigueRisk.barBg}`} 
                style={{ width: `${Math.min(100, (fatigueDropOff / 25) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stagnant Topics */}
        <div className={`rounded-lg border p-4 ${stagnantRisk.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <BookOpen className={`h-5 w-5 ${stagnantRisk.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Stagnant Topics</h4>
                <p className="text-xs text-slate-500">Topics with no improvement in 2 weeks</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${stagnantRisk.color}`}>{stagnantTopics}</div>
              <Badge variant="secondary" className={`text-xs ${stagnantRisk.bg} ${stagnantRisk.color}`}>
                {stagnantRisk.label}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>0</span>
              <span>3</span>
              <span>5</span>
              <span>10+</span>
            </div>
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              {/* @ts-expect-error Dynamic width requires inline style */}
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${stagnantRisk.barBg}`} 
                style={{ width: `${Math.min(100, (stagnantTopics / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Areas of Improvement - Matrix view showing topic performance by subject
 */
function WeaknessHeatmapCard({ data }: { data: Array<{ topic: string; scores: number[]; masteryLevel?: string; needsFocus?: boolean; subject?: string }> }) {
  // Group data by topic and subject
  const subjects = ['english', 'mathematics', 'verbal_reasoning']
  const subjectLabels: Record<string, string> = {
    'english': 'English',
    'mathematics': 'Maths',
    'verbal_reasoning': 'VR'
  }

  // Get unique topics
  const topics = [...new Set(data.map(d => d.topic))]

  // Create a lookup for topic+subject -> accuracy
  const cellLookup: Record<string, { accuracy: number; masteryLevel?: string; needsFocus?: boolean }> = {}
  data.forEach(item => {
    if (item.subject) {
      const key = `${item.topic}|${item.subject}`
      cellLookup[key] = { 
        accuracy: item.scores[0] || 0, 
        masteryLevel: item.masteryLevel,
        needsFocus: item.needsFocus
      }
    }
  })

  // Get cell color based on accuracy
  const getCellStyle = (accuracy: number) => {
    if (accuracy === 0) return "bg-slate-100 text-slate-400"
    if (accuracy >= 85) return "bg-emerald-500 text-white"
    if (accuracy >= 75) return "bg-emerald-400 text-white"
    if (accuracy >= 65) return "bg-lime-400 text-slate-800"
    if (accuracy >= 55) return "bg-yellow-400 text-slate-800"
    if (accuracy >= 45) return "bg-orange-400 text-white"
    return "bg-red-500 text-white"
  }

  // Calculate summary stats
  const totalTopics = topics.length
  const masteredTopics = data.filter(d => d.masteryLevel === 'mastered').length
  const needFocusTopics = data.filter(d => d.needsFocus).length
  const avgAccuracy = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + (d.scores[0] || 0), 0) / data.length)
    : 0

  // Check if we have real data
  if (topics.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Areas of Improvement</CardTitle>
          <CardDescription>Track your progress and identify opportunities to grow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No performance data yet</p>
            <p className="text-sm text-slate-400 mt-2">Complete some practice questions to see your progress</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Areas of Improvement</CardTitle>
        <CardDescription>Track your progress and identify opportunities to grow</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span>Track performance across subjects and topics</span>
          <div className="flex items-center gap-1">
            <span>Weak</span>
            <div className="flex">
              <div className="w-4 h-3 bg-red-500" />
              <div className="w-4 h-3 bg-orange-400" />
              <div className="w-4 h-3 bg-yellow-400" />
              <div className="w-4 h-3 bg-lime-400" />
              <div className="w-4 h-3 bg-emerald-400" />
              <div className="w-4 h-3 bg-emerald-500" />
            </div>
            <span>Strong</span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">Topic</th>
                {subjects.map(subject => (
                  <th key={subject} className="text-center text-xs font-medium text-slate-500 pb-2 px-2 min-w-[80px]">
                    {subjectLabels[subject]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic}>
                  <td className="text-sm font-medium text-slate-700 py-1 pr-4">{topic}</td>
                  {subjects.map(subject => {
                    const key = `${topic}|${subject}`
                    const cell = cellLookup[key]
                    const accuracy = cell?.accuracy || 0
                    return (
                      <td key={subject} className="py-1 px-2">
                        <div className={`h-8 rounded flex items-center justify-center text-sm font-medium ${getCellStyle(accuracy)}`}>
                          {accuracy > 0 ? `${Math.round(accuracy)}%` : '-'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{totalTopics}</p>
            <p className="text-xs text-slate-500">Topics Practiced</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{masteredTopics}</p>
            <p className="text-xs text-slate-500">Topics Mastered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{needFocusTopics}</p>
            <p className="text-xs text-slate-500">Need Focus</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{avgAccuracy}%</p>
            <p className="text-xs text-slate-500">Avg. Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Performance Tables with real data
 */
function PerformanceTablesCard({ 
  subjectPerformance, 
  difficultyPerformance 
}: { 
  subjectPerformance: Array<{ subject: string; questions: number; accuracy: number }>
  difficultyPerformance: Array<{ level: string; count: number; accuracy: number }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detailed Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subject">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subject">By Subject</TabsTrigger>
            <TabsTrigger value="topic">By Topic</TabsTrigger>
            <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
          </TabsList>
          <TabsContent value="subject" className="space-y-4 mt-4">
            {subjectPerformance.length > 0 ? (
              subjectPerformance.map((item) => (
                <div key={item.subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">{item.subject}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{item.questions} questions</span>
                    <Badge 
                      variant="secondary"
                      className={item.accuracy >= 80 ? "bg-emerald-100" : item.accuracy >= 60 ? "bg-amber-100" : "bg-red-100"}
                    >
                      {Math.round(item.accuracy)}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No subject data available yet
              </p>
            )}
          </TabsContent>
          <TabsContent value="topic" className="mt-4">
            <p className="text-sm text-slate-500 text-center py-8">
              Select a subject to view topic breakdown
            </p>
          </TabsContent>
          <TabsContent value="difficulty" className="mt-4">
            <div className="space-y-3">
              {difficultyPerformance.length > 0 ? (
                difficultyPerformance.map((d) => (
                  <div key={d.level} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">{d.level}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{d.count} questions</span>
                      <Badge 
                        variant="secondary"
                        className={d.accuracy >= 80 ? "bg-emerald-100" : d.accuracy >= 60 ? "bg-amber-100" : "bg-red-100"}
                      >
                        {Math.round(d.accuracy)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No difficulty data available yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

/**
 * Mock Study Recommendations (placeholder)
 */
function StudyRecommendationsCard() {
  const recommendations = [
    {
      priority: "high",
      topic: "Fractions",
      action: "Focus on fraction addition with different denominators",
      time: "20 mins/day",
    },
    {
      priority: "medium",
      topic: "Comprehension",
      action: "Practice inference questions with longer passages",
      time: "15 mins/day",
    },
    {
      priority: "low",
      topic: "Synonyms",
      action: "Review vocabulary from recent incorrect answers",
      time: "10 mins/day",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Study Recommendations
        </CardTitle>
        <CardDescription>Personalized action plan based on performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === "high"
                  ? "border-l-red-500 bg-red-50"
                  : rec.priority === "medium"
                  ? "border-l-amber-500 bg-amber-50"
                  : "border-l-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{rec.topic}</p>
                  <p className="text-sm text-slate-600 mt-1">{rec.action}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {rec.time}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          Generate Practice Session
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Benchmarking Card with real data
 */
function BenchmarkingCardComponent({ benchmarking }: { 
  benchmarking: {
    overallPercentile: number
    subjectPercentiles: Array<{ subject: string; percentile: number }>
  } | null
}) {
  // Format subject name for display
  const formatSubject = (subject: string): string => {
    return subject
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (!benchmarking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compared to Others
          </CardTitle>
          <CardDescription>Anonymous comparison with similar learners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">Benchmarking data requires Summit tier</p>
            <p className="text-sm text-slate-400 mt-2">Upgrade to see how you compare to others</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Compared to Others
        </CardTitle>
        <CardDescription>Anonymous comparison with similar learners</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-blue-600">
              Top {100 - benchmarking.overallPercentile}%
            </p>
            <p className="text-sm text-slate-500 mt-1">of Year 5 students</p>
          </div>

          <div className="space-y-3">
            {benchmarking.subjectPercentiles.map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{formatSubject(item.subject)}</span>
                  <span className="font-medium">Top {100 - item.percentile}%</span>
                </div>
                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                  {/* @ts-expect-error Dynamic width requires inline style */}
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.percentile}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Analytics Dashboard - Main Component
 * 
 * Orchestrates the comprehensive analytics layout with all sections.
 * 
 * @param childId - The UUID of the child to show analytics for
 * @param childName - The display name of the child
 */
export function AnalyticsDashboard2({ childId, childName }: AnalyticsDashboard2Props) {
  const [dateRange, setDateRange] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real data state
  const [analyticsData, setAnalyticsData] = useState<{
    kpis: {
      readinessScore: number
      readinessTrend: number
      ascentScore: number
      ascentTrend: number
      velocity: number
      velocityTrend: number
      totalQuestions: number
    }
    risks: {
      rushFactor: number
      fatigueDropOff: number
      stagnantTopics: number
    }
    readiness: {
      score: number
      breakdown: {
        accuracy: number
        coverage: number
        consistency: number
      }
    }
    heatmapData: Array<{ topic: string; scores: number[]; masteryLevel?: string; needsFocus?: boolean; subject?: string }>
    subjectPerformance: Array<{ subject: string; questions: number; accuracy: number }>
    difficultyPerformance: Array<{ level: string; count: number; accuracy: number }>
    benchmarking: {
      overallPercentile: number
      subjectPercentiles: Array<{ subject: string; percentile: number }>
    } | null
  } | null>(null)

  // Map date range to API format
  const getApiDateRange = (range: string) => {
    switch (range) {
      case "7d": return "last_7_days"
      case "30d": return "last_30_days"
      case "90d": return "last_90_days"
      case "all": return "all_time"
      default: return "last_30_days"
    }
  }

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const apiDateRange = getApiDateRange(dateRange)
      
      // Map date range to days for learning health API
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "all": 365
      }
      const days = daysMap[dateRange] || 30
      
      // Fetch all data in parallel
      const [comprehensiveRes, readinessRes, heatmapRes, benchmarkRes, learningHealthRes] = await Promise.all([
        fetch(`/api/analytics/comprehensive?childId=${childId}&range=${apiDateRange}`),
        fetch(`/api/analytics/readiness?childId=${childId}`),
        fetch(`/api/analytics/heatmap?childId=${childId}`),
        fetch(`/api/analytics/benchmark?childId=${childId}`).catch(() => null),
        fetch(`/api/analytics/learning-health?childId=${childId}&days=${days}`),
      ])

      const comprehensive = comprehensiveRes.ok ? await comprehensiveRes.json() : null
      const readiness = readinessRes.ok ? await readinessRes.json() : null
      const heatmap = heatmapRes.ok ? await heatmapRes.json() : null
      const benchmark = benchmarkRes?.ok ? await benchmarkRes.json() : null
      const learningHealth = learningHealthRes.ok ? await learningHealthRes.json() : null

      // Transform heatmap data for the grid view
      // The heatmap API returns: { data: { subjects: [], topics: [], cells: [] } }
      // Each cell has: { subject, topic, accuracy, totalQuestions, masteryLevel, needsFocus }
      const transformedHeatmap: Array<{ topic: string; scores: number[]; masteryLevel?: string; needsFocus?: boolean; subject?: string }> = []
      if (heatmap?.data?.cells && Array.isArray(heatmap.data.cells)) {
        heatmap.data.cells.forEach((cell: any) => {
          const accuracy = cell.accuracy || 0
          transformedHeatmap.push({ 
            topic: cell.topic || 'Unknown', 
            scores: [accuracy, accuracy, accuracy],
            masteryLevel: cell.masteryLevel,
            needsFocus: cell.needsFocus,
            subject: cell.subject, // Include subject for matrix view
          })
        })
      }

      // Extract subject performance from comprehensive data
      // The API returns subjectBreakdown as an array, not an object
      const subjectPerformance: Array<{ subject: string; questions: number; accuracy: number }> = []
      if (comprehensive?.subjectBreakdown && Array.isArray(comprehensive.subjectBreakdown)) {
        comprehensive.subjectBreakdown.forEach((item: any) => {
          subjectPerformance.push({
            subject: formatSubjectName(item.subject || item.subjectLabel || ''),
            questions: item.totalQuestions || item.totalAttempts || 0,
            accuracy: item.accuracy || 0,
          })
        })
      } else if (comprehensive?.subjectBreakdown && typeof comprehensive.subjectBreakdown === 'object') {
        Object.entries(comprehensive.subjectBreakdown).forEach(([subject, data]: [string, any]) => {
          subjectPerformance.push({
            subject: formatSubjectName(subject),
            questions: data.totalQuestions || data.totalAttempts || 0,
            accuracy: data.accuracy || 0,
          })
        })
      }

      // Extract difficulty performance
      const difficultyPerformance: Array<{ level: string; count: number; accuracy: number }> = []
      if (comprehensive?.difficultyBreakdown && Array.isArray(comprehensive.difficultyBreakdown)) {
        comprehensive.difficultyBreakdown.forEach((item: any) => {
          difficultyPerformance.push({
            level: (item.difficulty || item.level || '').charAt(0).toUpperCase() + (item.difficulty || item.level || '').slice(1),
            count: item.totalQuestions || item.totalAttempts || item.count || 0,
            accuracy: item.accuracy || 0,
          })
        })
      } else if (comprehensive?.difficultyBreakdown && typeof comprehensive.difficultyBreakdown === 'object') {
        Object.entries(comprehensive.difficultyBreakdown).forEach(([level, data]: [string, any]) => {
          difficultyPerformance.push({
            level: level.charAt(0).toUpperCase() + level.slice(1),
            count: data.totalQuestions || data.totalAttempts || 0,
            accuracy: data.accuracy || 0,
          })
        })
      }

      // Calculate KRIs (Risk Indicators) from learning health API
      // Use the dedicated API instead of calculating from comprehensive data
      const rushFactor = learningHealth?.data?.rushFactor || 0
      const fatigueDropOff = learningHealth?.data?.fatigueDropOff || 0
      const stagnantTopics = learningHealth?.data?.stagnantTopics || 0

      // Extract trend values (trend can be an object or a number)
      const readinessTrend = typeof readiness?.data?.trend === 'object' 
        ? readiness?.data?.trend?.changePercentage || 0 
        : (readiness?.data?.trend || 0)
      const ascentTrend = typeof comprehensive?.ascentScoreTrend === 'object'
        ? comprehensive?.ascentScoreTrend?.changePercentage || 0
        : (comprehensive?.ascentScoreTrend || 0)
      const velocityTrend = typeof comprehensive?.velocityTrend === 'object'
        ? comprehensive?.velocityTrend?.changePercentage || 0
        : (comprehensive?.velocityTrend || 0)

      setAnalyticsData({
        kpis: {
          // Readiness comes from readiness API
          readinessScore: readiness?.data?.overallScore || readiness?.data?.score || 0,
          readinessTrend: Number(readinessTrend) || 0,
          // Ascent score - use overall accuracy as proxy if not available
          ascentScore: comprehensive?.ascentScore || comprehensive?.summary?.overallAccuracy || Math.round(comprehensive?.summary?.accuracy || 0),
          ascentTrend: Number(ascentTrend) || 0,
          // Velocity - questions answered in period
          velocity: comprehensive?.summary?.totalQuestionsAnswered || comprehensive?.summary?.totalQuestions || 0,
          velocityTrend: Number(velocityTrend) || 0,
          // Total questions
          totalQuestions: comprehensive?.summary?.totalQuestionsAnswered || comprehensive?.summary?.totalQuestions || comprehensive?.totalAttempts || 0,
        },
        risks: {
          rushFactor: Math.round(rushFactor),
          fatigueDropOff: Math.round(fatigueDropOff),
          stagnantTopics: Math.round(stagnantTopics),
        },
        readiness: {
          score: readiness?.data?.overallScore || readiness?.data?.score || 0,
          breakdown: {
            accuracy: readiness?.data?.components?.accuracyScore 
              ? (readiness.data.components.accuracyScore / 40) * 100  // Convert from 40 max to percentage
              : (comprehensive?.summary?.overallAccuracy || comprehensive?.summary?.accuracy || 0),
            coverage: readiness?.data?.components?.coverageScore
              ? (readiness.data.components.coverageScore / 20) * 100  // Convert from 20 max to percentage
              : 0,
            consistency: readiness?.data?.components?.consistencyScore
              ? (readiness.data.components.consistencyScore / 15) * 100  // Convert from 15 max to percentage
              : 0,
          },
        },
        heatmapData: transformedHeatmap.length > 0 ? transformedHeatmap : [
          { topic: "No data yet", scores: [0, 0, 0] },
        ],
        subjectPerformance,
        difficultyPerformance,
        benchmarking: benchmark ? {
          overallPercentile: benchmark.overallPercentile || 50,
          subjectPercentiles: benchmark.subjectPercentiles || [],
        } : null,
      })

    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch on mount and when childId or dateRange changes
  useEffect(() => {
    if (childId) {
      fetchAnalytics()
    }
  }, [childId, dateRange])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalytics()
    setIsRefreshing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No analytics data available yet.</p>
        <p className="text-sm text-slate-400 mt-2">Complete some practice questions to see your progress.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {childName}'s Learning Journey
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <AnalyticsHelp />
        </div>
      </div>

      {/* Section 1: Executive Summary (KPIs) */}
      <section>
        <SectionHeader
          icon={BarChart3}
          title="Executive Summary"
          description="Key performance indicators at a glance"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Target}
            title="Readiness Score"
            value={`${Math.round(analyticsData.kpis.readinessScore)}%`}
            subtitle="Exam preparation status"
            trend={analyticsData.kpis.readinessTrend}
            trendLabel="vs last period"
            color="bg-emerald-500"
          />
          <KPICard
            icon={Award}
            title="Ascent Score"
            value={Math.round(analyticsData.kpis.ascentScore)}
            subtitle="Weighted mastery"
            trend={analyticsData.kpis.ascentTrend}
            trendLabel="vs last period"
            color="bg-blue-500"
          />
          <KPICard
            icon={Zap}
            title="Velocity"
            value={`+${analyticsData.kpis.velocity}`}
            subtitle="Questions this week"
            trend={analyticsData.kpis.velocityTrend}
            trendLabel="vs last week"
            color="bg-purple-500"
          />
          <KPICard
            icon={BookOpen}
            title="Total Practice"
            value={analyticsData.kpis.totalQuestions}
            subtitle="Questions completed"
            color="bg-slate-500"
          />
        </div>
      </section>

      {/* Section 2: Learning Health Check (KRIs) */}
      <section>
        <SectionHeader
          icon={Target}
          title="Learning Health Check"
          description="Optimize practice habits for better exam preparation"
        />
        <LearningHealthCheckCard
          rushFactor={analyticsData.risks.rushFactor}
          fatigueDropOff={analyticsData.risks.fatigueDropOff}
          stagnantTopics={analyticsData.risks.stagnantTopics}
        />
      </section>

      {/* Section 3: Deep Dive (Readiness + Heatmap) */}
      <section>
        <SectionHeader
          icon={BarChart3}
          title="Deep Dive"
          description="Celebrate strengths and identify areas of improvement"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReadinessScoreCard
            score={analyticsData.readiness.score}
            breakdown={analyticsData.readiness.breakdown}
          />
          <WeaknessHeatmapCard data={analyticsData.heatmapData} />
        </div>
      </section>

      {/* Section 4: Details (Tabbed Performance) */}
      <section>
        <SectionHeader
          icon={BarChart3}
          title="Performance Details"
          description="Breakdown by subject, topic, and difficulty"
        />
        <PerformanceTablesCard 
          subjectPerformance={analyticsData.subjectPerformance}
          difficultyPerformance={analyticsData.difficultyPerformance}
        />
      </section>

      {/* Section 5: Action Plan */}
      <section>
        <SectionHeader
          icon={BookOpen}
          title="Action Plan"
          description="Personalized recommendations and benchmarking"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudyRecommendationsCard />
          <BenchmarkingCardComponent benchmarking={analyticsData.benchmarking} />
        </div>
      </section>
    </div>
  )
}

export default AnalyticsDashboard2
