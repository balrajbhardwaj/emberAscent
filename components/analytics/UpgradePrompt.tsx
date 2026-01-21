/**
 * Upgrade Prompt Component
 * 
 * Reusable CTA for upgrading to paid tier.
 * Used in analytics preview and other gated features.
 * 
 * @module components/analytics/UpgradePrompt
 */
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react'

interface UpgradePromptProps {
  childName?: string
  variant?: 'card' | 'inline'
}

/**
 * Benefits list for Ascent tier
 */
const ASCENT_BENEFITS = [
  'Weakness Heatmap - See exactly where to focus',
  'Readiness Score - Know if your child is on track',
  'Personalized Study Plans - AI-powered recommendations',
  'Weekly Progress Reports - Delivered to your inbox',
  'Growth Analytics - Track improvement over time'
]

/**
 * Upgrade Prompt
 * 
 * Displays upgrade CTA with benefits list.
 */
export function UpgradePrompt({ childName, variant = 'card' }: UpgradePromptProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">Unlock Deep Insights</p>
            <p className="text-sm text-slate-600">Upgrade to see detailed analytics</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" asChild>
          <a href="/settings/subscription">
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Card className="max-w-md w-full shadow-xl border-2 border-amber-200">
      <CardContent className="p-8 text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Unlock Deep Insights
        </h2>
        <p className="text-slate-600 mb-6">
          {childName 
            ? `Help ${childName} succeed with powerful analytics`
            : 'Get the insights you need to help your child succeed'
          }
        </p>

        {/* Benefits */}
        <ul className="text-left space-y-3 mb-6">
          {ASCENT_BENEFITS.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-3xl font-bold text-slate-900">£12.99</span>
            <span className="text-slate-500">/month</span>
          </div>
          <p className="text-xs text-slate-500">
            or £129/year (save £26.88)
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
            asChild
          >
            <a href="/settings/subscription">
              <Sparkles className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </a>
          </Button>
          
          <Button variant="link" className="text-slate-600" asChild>
            <a href="/transparency/pricing">
              Learn more about pricing
            </a>
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="text-xs text-slate-500 mt-4">
          Cancel anytime • No commitment • Full refund within 14 days
        </p>
      </CardContent>
    </Card>
  )
}

export default UpgradePrompt
