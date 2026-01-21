/**
 * Readiness Score Component
 * 
 * Displays the 11+ exam readiness score with breakdown
 * and trend visualization.
 * 
 * @module components/analytics/ReadinessScore
 */
"use client"

import { useState } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  Calendar,
  Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ScoreGauge } from "./ScoreGauge"
import type { 
  ReadinessScoreData, 
  ReadinessTier,
  SubjectReadiness 
} from "@/types/analytics"

interface ReadinessScoreProps {
  data: ReadinessScoreData | null
  childName?: string
  isLoading?: boolean
  showBreakdown?: boolean
  showTrend?: boolean
  className?: string
}

/**
 * Readiness Score Display
 * 
 * Shows the overall readiness score with:
 * - Circular gauge visualization
 * - Tier badge (Excellent, Good, Developing, Needs Focus)
 * - Component breakdown
 * - Subject-specific scores
 * - Confidence indicator
 * 
 * @param data - Readiness score data
 * @param childName - Child's name for personalization
 * @param isLoading - Loading state
 * @param showBreakdown - Whether to show score breakdown
 * @param showTrend - Whether to show trend data
 */
export function ReadinessScore({
  data,
  childName = "Your child",
  isLoading = false,
  showBreakdown = true,
  showTrend = true,
  className
}: ReadinessScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return <ReadinessScoreSkeleton />
  }

  if (!data) {
    return <ReadinessScoreEmpty childName={childName} />
  }

  const tierConfig = getTierConfig(data.overallTier)

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Readiness Score
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      The Readiness Score estimates how prepared {childName} is for the 11+ exam
                      based on practice performance, topic coverage, and consistency.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              How prepared is {childName} for the 11+ exam?
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-sm", tierConfig.badgeClass)}
          >
            {tierConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          {/* Gauge */}
          <ScoreGauge 
            score={data.overallScore} 
            tier={data.overallTier}
            size="lg"
          />

          {/* Score Details */}
          <div className="space-y-3 text-center sm:text-left">
            <div>
              <div className="text-4xl font-bold text-slate-900">
                {data.overallScore}
                <span className="text-lg text-slate-400">/100</span>
              </div>
              <div className={cn("text-sm font-medium", tierConfig.textClass)}>
                {tierConfig.description}
              </div>
            </div>

            {/* Confidence Indicator */}
            <ConfidenceIndicator confidence={data.confidence} />

            {/* Trend */}
            {showTrend && data.trend && (
              <TrendIndicator trend={data.trend} />
            )}
          </div>
        </div>

        {/* Subject Scores */}
        {data.subjectScores && data.subjectScores.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">By Subject</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.subjectScores.map((subject) => (
                <SubjectScoreCard key={subject.subject} subject={subject} />
              ))}
            </div>
          </div>
        )}

        {/* Expandable Breakdown */}
        {showBreakdown && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="text-sm text-slate-600">How is this calculated?</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <ScoreBreakdown components={data.components} />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Disclaimer */}
        {data.disclaimer && (
          <p className="text-xs text-slate-400 text-center italic">
            {data.disclaimer}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Confidence indicator component
 */
function ConfidenceIndicator({ confidence }: { confidence?: ReadinessScoreData['confidence'] }) {
  const config = {
    high: { color: 'text-green-600', bg: 'bg-green-100', label: 'High Confidence' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medium Confidence' },
    low: { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Confidence' }
  }

  // Default to low if confidence is undefined or level is unknown
  const level = confidence?.level || 'low'
  const levelConfig = config[level as keyof typeof config] || config.low

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
            levelConfig.bg,
            levelConfig.color
          )}>
            <Target className="h-3 w-3" />
            {levelConfig.label}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{confidence?.message || 'Confidence based on available data'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Trend indicator component
 */
function TrendIndicator({ trend }: { trend: ReadinessScoreData['trend'] }) {
  const TrendIcon = trend.direction === 'up' ? TrendingUp 
    : trend.direction === 'down' ? TrendingDown 
    : Minus

  const trendColor = trend.direction === 'up' ? 'text-green-600'
    : trend.direction === 'down' ? 'text-red-600'
    : 'text-slate-500'

  const changeText = trend.changeAmount >= 0 
    ? `+${trend.changeAmount.toFixed(1)}`
    : trend.changeAmount.toFixed(1)

  return (
    <div className="flex items-center gap-2">
      <TrendIcon className={cn("h-4 w-4", trendColor)} />
      <span className={cn("text-sm font-medium", trendColor)}>
        {changeText} points
      </span>
      <span className="text-xs text-slate-400">
        vs last {trend.periodDays} days
      </span>
    </div>
  )
}

/**
 * Subject score card
 */
function SubjectScoreCard({ subject }: { subject: SubjectReadiness }) {
  const tierConfig = getTierConfig(subject.tier)

  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-sm font-medium text-slate-700 truncate">
          {subject.subjectLabel}
        </span>
        <span className={cn("text-xl font-bold", tierConfig.textClass)}>
          {subject.score}%
        </span>
      </div>
      <Progress value={subject.score} className="h-2" />
      <div className="mt-2 text-xs text-slate-500">
        {subject.topicsCovered}/{subject.totalTopics} topics covered
      </div>
    </div>
  )
}

/**
 * Score breakdown component
 */
function ScoreBreakdown({ components }: { components: ReadinessScoreData['components'] }) {
  const breakdownItems = [
    {
      icon: Target,
      label: 'Accuracy',
      value: components.accuracyScore,
      maxValue: 40,
      description: 'Based on overall correct answer rate'
    },
    {
      icon: Award,
      label: 'Topic Coverage',
      value: components.coverageScore,
      maxValue: 20,
      description: 'Topics practiced vs total available'
    },
    {
      icon: Calendar,
      label: 'Consistency',
      value: components.consistencyScore,
      maxValue: 15,
      description: 'Regular practice over time'
    },
    {
      icon: Zap,
      label: 'Challenge Performance',
      value: components.difficultyScore,
      maxValue: 15,
      description: 'Performance at challenge difficulty'
    },
    {
      icon: TrendingUp,
      label: 'Improvement',
      value: components.improvementScore,
      maxValue: 10,
      description: 'Rate of accuracy improvement'
    }
  ]

  return (
    <div className="space-y-3">
      {breakdownItems.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <item.icon className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">
                {item.value.toFixed(1)}/{item.maxValue}
              </span>
            </div>
            <Progress 
              value={(item.value / item.maxValue) * 100} 
              className="h-1.5" 
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Get tier configuration
 */
function getTierConfig(tier: ReadinessTier) {
  const configs = {
    excellent: {
      label: 'Excellent',
      description: 'Strong exam preparation',
      badgeClass: 'border-green-500 text-green-700 bg-green-50',
      textClass: 'text-green-600'
    },
    good: {
      label: 'Good',
      description: 'On track for success',
      badgeClass: 'border-blue-500 text-blue-700 bg-blue-50',
      textClass: 'text-blue-600'
    },
    developing: {
      label: 'Developing',
      description: 'Making good progress',
      badgeClass: 'border-amber-500 text-amber-700 bg-amber-50',
      textClass: 'text-amber-600'
    },
    needs_focus: {
      label: 'Needs Focus',
      description: 'More practice recommended',
      badgeClass: 'border-red-500 text-red-700 bg-red-50',
      textClass: 'text-red-600'
    }
  }

  return configs[tier] || configs.developing
}

/**
 * Loading skeleton
 */
function ReadinessScoreSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-8">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state
 */
function ReadinessScoreEmpty({ childName }: { childName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Score</CardTitle>
        <CardDescription>
          Track 11+ exam preparation progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-medium text-slate-900 mb-2">Not enough data yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {childName} needs to complete more practice sessions before we can 
            calculate a readiness score. Keep practising!
          </p>
          <Button className="mt-4" asChild>
            <a href="/practice">Start Practice</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReadinessScore
