/**
 * MetricCard Component
 *
 * Reusable stat block for admin overview metrics.
 */

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string
  description?: string
  trendLabel?: string
  trendDirection?: 'up' | 'down' | 'flat'
  icon?: React.ReactNode
}

const TREND_STYLES: Record<NonNullable<MetricCardProps['trendDirection']>, string> = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  flat: 'text-slate-500',
}

export function MetricCard({ title, value, description, trendLabel, trendDirection = 'flat', icon }: MetricCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
        {trendLabel && (
          <p className={cn('mt-1 text-xs font-medium', TREND_STYLES[trendDirection])}>{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
