/**
 * Feature Comparison Table
 * 
 * Shows tier comparison for free/Ascent/Summit features.
 * Helps users understand the value of upgrading.
 * 
 * @module components/analytics/FeatureComparison
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Minus, Sparkles, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureComparisonProps {
  currentTier: string
  showHeader?: boolean
}

interface Feature {
  name: string
  description?: string
  free: boolean | 'limited'
  ascent: boolean | 'limited'
  summit: boolean | 'limited'
}

/**
 * Feature list for comparison
 */
const FEATURES: Feature[] = [
  {
    name: 'Unlimited Practice Questions',
    description: 'Access all questions across all subjects',
    free: true,
    ascent: true,
    summit: true
  },
  {
    name: 'Basic Progress Tracking',
    description: 'See overall progress and recent activity',
    free: true,
    ascent: true,
    summit: true
  },
  {
    name: 'Adaptive Difficulty',
    description: 'Questions adapt to skill level',
    free: true,
    ascent: true,
    summit: true
  },
  {
    name: 'Weakness Heatmap',
    description: 'Visual breakdown of strong and weak areas',
    free: false,
    ascent: true,
    summit: true
  },
  {
    name: 'Readiness Score',
    description: '11+ exam readiness indicator',
    free: false,
    ascent: true,
    summit: true
  },
  {
    name: 'Personalized Study Plans',
    description: 'AI-generated weekly study recommendations',
    free: false,
    ascent: true,
    summit: true
  },
  {
    name: 'Growth Analytics',
    description: 'Track improvement over time',
    free: false,
    ascent: true,
    summit: true
  },
  {
    name: 'Weekly Progress Reports',
    description: 'Email reports delivered to parents',
    free: false,
    ascent: true,
    summit: true
  },
  {
    name: 'Percentile Benchmarking',
    description: 'Compare to other learners (anonymized)',
    free: false,
    ascent: false,
    summit: true
  },
  {
    name: 'Priority Support',
    description: 'Get help when you need it',
    free: false,
    ascent: false,
    summit: true
  }
]

/**
 * Get check/x icon for feature availability
 */
function FeatureIcon({ available }: { available: boolean | 'limited' }) {
  if (available === true) {
    return <Check className="h-5 w-5 text-green-600" />
  }
  if (available === 'limited') {
    return <Minus className="h-5 w-5 text-amber-500" />
  }
  return <X className="h-5 w-5 text-slate-300" />
}

/**
 * Feature Comparison Table
 * 
 * Displays features available in each subscription tier.
 */
export function FeatureComparison({ 
  currentTier, 
  showHeader = true 
}: FeatureComparisonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>
            Find the right plan for your family&apos;s learning journey
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={cn(!showHeader && 'pt-6')}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 pr-4 font-medium text-slate-600 w-1/3">
                  Feature
                </th>
                <th className="text-center py-4 px-4 w-1/5">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900">Free</span>
                    <div className="text-sm text-slate-500">£0</div>
                    {currentTier === 'free' && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                </th>
                <th className="text-center py-4 px-4 w-1/5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-slate-900">Ascent</span>
                    </div>
                    <div className="text-sm text-slate-500">£12.99/mo</div>
                    {currentTier === 'ascent' && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Current</Badge>
                    )}
                  </div>
                </th>
                <th className="text-center py-4 px-4 w-1/5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-slate-900">Summit</span>
                    </div>
                    <div className="text-sm text-slate-500">£24.99/mo</div>
                    {currentTier === 'summit' && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">Current</Badge>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr 
                  key={feature.name}
                  className={cn(
                    'border-b border-slate-100',
                    i % 2 === 0 && 'bg-slate-50/50'
                  )}
                >
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-medium text-slate-900">{feature.name}</p>
                      {feature.description && (
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex justify-center">
                      <FeatureIcon available={feature.free} />
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex justify-center">
                      <FeatureIcon available={feature.ascent} />
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex justify-center">
                      <FeatureIcon available={feature.summit} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {/* Ascent Card */}
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-lg">Ascent</span>
              <span className="text-slate-600">£12.99/mo</span>
            </div>
            <ul className="space-y-2">
              {FEATURES.filter(f => f.ascent === true).map(f => (
                <li key={f.name} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
              disabled={currentTier === 'ascent' || currentTier === 'summit'}
            >
              {currentTier === 'ascent' ? 'Current Plan' : 'Upgrade to Ascent'}
            </Button>
          </div>

          {/* Summit Card */}
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-lg">Summit</span>
              <span className="text-slate-600">£24.99/mo</span>
            </div>
            <ul className="space-y-2">
              {FEATURES.filter(f => f.summit === true).map(f => (
                <li key={f.name} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
              disabled={currentTier === 'summit'}
            >
              {currentTier === 'summit' ? 'Current Plan' : 'Upgrade to Summit'}
            </Button>
          </div>
        </div>

        {/* CTA for free users */}
        {currentTier === 'free' && (
          <div className="mt-6 text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              asChild
            >
              <a href="/settings/subscription">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Free Trial
              </a>
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              7 days free • Cancel anytime
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FeatureComparison
