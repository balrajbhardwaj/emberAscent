/**
 * Analytics Preview for Free Tier
 * 
 * Shows a blurred preview of the analytics dashboard
 * with an upgrade prompt for free tier users.
 * 
 * @module components/analytics/AnalyticsPreview
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { FeatureComparison } from './FeatureComparison'
import { UpgradePrompt } from './UpgradePrompt'

interface AnalyticsPreviewProps {
  childName: string
  subscriptionTier: string
}

/**
 * Analytics Preview
 * 
 * Blurred preview of analytics with upgrade CTA for free tier users.
 */
export function AnalyticsPreview({ 
  childName,
  subscriptionTier 
}: AnalyticsPreviewProps) {
  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium Feature
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get deep insights into {childName}&apos;s learning journey with our powerful analytics tools.
          </p>
        </div>

        {/* Blurred Preview Grid */}
        <div className="relative">
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 rounded-xl" />
          
          {/* Preview content (visible but blurred) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-xl pointer-events-none select-none">
            {/* Metric cards placeholder */}
            <div className="lg:col-span-3 grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-white/80">
                  <CardContent className="p-6">
                    <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
                    <div className="h-8 w-16 bg-slate-300 rounded mb-1" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Readiness Score placeholder */}
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-400">Readiness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-300">??</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
              </CardContent>
            </Card>

            {/* Heatmap placeholder */}
            <Card className="lg:col-span-2 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-400">Weakness Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {Array(24).fill(0).map((_, i) => (
                    <div 
                      key={i}
                      className={`h-8 rounded ${
                        ['bg-green-200', 'bg-amber-200', 'bg-red-200', 'bg-slate-200'][i % 4]
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart placeholder */}
            <Card className="lg:col-span-3 bg-white/80">
              <CardHeader>
                <CardTitle className="text-slate-400">Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-2 px-4">
                  {[30, 45, 40, 55, 50, 65, 70, 68, 75, 80, 78, 85].map((h, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-gradient-to-t from-orange-200 to-amber-100 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Centered CTA overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <UpgradePrompt childName={childName} />
          </div>
        </div>

        {/* Free Tier Metrics - Show some real data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              Basic Progress
              <Badge variant="secondary" className="text-xs">Free</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              View detailed analytics and unlock powerful insights by upgrading to Ascent.
            </p>
            <Button asChild>
              <a href="/progress">
                View Basic Progress
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Feature Comparison */}
        <FeatureComparison currentTier={subscriptionTier} />
      </div>
    </div>
  )
}

export default AnalyticsPreview
