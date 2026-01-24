/**
 * Paywall Card Component
 * 
 * Reusable paywall overlay for premium features.
 * Displays upgrade prompt with feature benefits.
 * 
 * @module components/common/PaywallCard
 */
import Link from 'next/link'
import { Sparkles, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PaywallCardProps {
  feature: string
  description: string
  benefits: string[]
}

/**
 * Paywall Card
 * 
 * Shows when free users try to access premium features.
 * Encourages upgrade to Ascent tier.
 */
export function PaywallCard({ 
  feature, 
  description,
  benefits 
}: PaywallCardProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="py-12 px-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
            <Sparkles className="h-8 w-8 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {feature} is an Ascent Feature
          </h2>
          <p className="text-slate-600 mb-6">{description}</p>
          
          <div className="bg-amber-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-3">
              What you'll unlock with Ascent:
            </h3>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/pricing">
              Upgrade to Ascent - £14.99/month
            </Link>
          </Button>
          
          <p className="text-sm text-slate-500 mt-4">
            Questions remain free forever. Analytics and oversight require Ascent.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
