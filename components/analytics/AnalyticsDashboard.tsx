/**
 * Analytics Dashboard Container
 * 
 * Main container component for the premium analytics dashboard.
 * Orchestrates all analytics components and data fetching.
 * 
 * @module components/analytics/AnalyticsDashboard
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, RefreshCw, Calendar, Clock } from 'lucide-react'
import { KeyMetricsRow } from './KeyMetricsRow'
import { WeaknessHeatmap } from './WeaknessHeatmap'
import { ReadinessScore } from './ReadinessScore'
import { GrowthChart } from './GrowthChart'
import { PerformanceTables } from './PerformanceTables'
import { StudyRecommendations } from './StudyRecommendations'
import { BenchmarkingCard } from './BenchmarkingCard'
import { useWeaknessData } from '@/hooks/useWeaknessData'
import { useReadinessScore } from '@/hooks/useReadinessScore'
import type { DateRangePreset, ChildAnalytics } from '@/types/analytics'

interface AnalyticsDashboardProps {
  childId: string
  childName: string
  subscriptionTier: string
}

/**
 * Analytics Dashboard
 * 
 * Premium feature displaying comprehensive learning analytics.
 */
export function AnalyticsDashboard({
  childId,
  childName,
  subscriptionTier
}: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRangePreset>('last_30_days')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Ensure client-side only rendering for time
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  // Fetch weakness data
  const { data: heatmapData, isLoading: heatmapLoading } = useWeaknessData(childId)
  
  // Fetch readiness score
  const { data: readinessData, isLoading: readinessLoading } = useReadinessScore(childId)

  // Fetch comprehensive analytics
  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/analytics/comprehensive?childId=${childId}&range=${dateRange}`
        )
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchAnalytics()
    }
  }, [childId, dateRange, mounted])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetch('/api/analytics/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId })
      })
      // Re-fetch data after refresh
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing analytics:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle topic click from heatmap
  const handleTopicClick = (subject: string, topic: string) => {
    // Navigate to practice with this topic pre-selected
    window.location.href = `/practice?subject=${subject}&topic=${encodeURIComponent(topic)}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics for {childName}
          </h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated || '--:--:--'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangePreset)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_14_days">Last 14 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Download Report */}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <KeyMetricsRow 
        analytics={analytics}
        readinessScore={readinessData?.overallScore}
        isLoading={isLoading || readinessLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Score - Left Column */}
        <div className="lg:col-span-1">
          <ReadinessScore
            data={readinessData}
            isLoading={readinessLoading}
            childName={childName}
          />
        </div>

        {/* Weakness Heatmap - Right 2 Columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Weakness Heatmap
                    <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Ascent Feature
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Topic performance across subjects - click any cell to practice
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WeaknessHeatmap
                data={heatmapData}
                isLoading={heatmapLoading}
                onTopicClick={handleTopicClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Growth Over Time */}
      <GrowthChart
        analytics={analytics}
      />

      {/* Detailed Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
          <CardDescription>
            Dive deeper into performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subject">
            <TabsList>
              <TabsTrigger value="subject">By Subject</TabsTrigger>
              <TabsTrigger value="topic">By Topic</TabsTrigger>
              <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
            </TabsList>
            <TabsContent value="subject" className="pt-4">
              <PerformanceTables 
                analytics={analytics}
                view="subject"
              />
            </TabsContent>
            <TabsContent value="topic" className="pt-4">
              <PerformanceTables 
                analytics={analytics}
                view="topic"
              />
            </TabsContent>
            <TabsContent value="difficulty" className="pt-4">
              <PerformanceTables 
                analytics={analytics}
                view="difficulty"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Study Recommendations & Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyRecommendations 
          childId={childId}
          analytics={analytics}
        />
        
        {subscriptionTier === 'summit' && (
          <BenchmarkingCard childId={childId} />
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard
