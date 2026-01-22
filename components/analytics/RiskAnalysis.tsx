/**
 * Risk Analysis Component
 * 
 * Visualizes the "Health" of the learning process using Key Risk Indicators (KRIs).
 * Helps parents identify behavioral patterns that may impact exam performance.
 * 
 * KRIs:
 * - Rush Factor: Questions answered too quickly (likely guessing)
 * - Fatigue Drop-off: Accuracy decline during longer sessions
 * - Stagnant Topics: Areas with no recent improvement
 * 
 * Color Thresholds:
 * - Green: <5% (healthy)
 * - Amber: 5-15% (needs attention)
 * - Red: >15% (critical)
 * 
 * @module components/analytics/RiskAnalysis
 */
"use client"

import {
  Activity,
  AlertTriangle,
  Battery,
  TrendingDown,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Risk level determination based on thresholds
 */
type RiskLevel = "healthy" | "warning" | "critical"

function getRiskLevel(value: number): RiskLevel {
  if (value < 5) return "healthy"
  if (value <= 15) return "warning"
  return "critical"
}

/**
 * Color configuration for risk levels
 */
const riskColors: Record<RiskLevel, { bg: string; text: string; progress: string; badge: string }> = {
  healthy: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    progress: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    progress: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    progress: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
}

const riskLabels: Record<RiskLevel, string> = {
  healthy: "Healthy",
  warning: "Needs Attention",
  critical: "Critical",
}

interface RiskMetricProps {
  icon: React.ElementType
  title: string
  value: number
  description: string
  tooltip: string
  suffix?: string
}

/**
 * Individual risk metric display
 */
function RiskMetric({
  icon: Icon,
  title,
  value,
  description,
  tooltip,
  suffix = "%",
}: RiskMetricProps) {
  const level = getRiskLevel(value)
  const colors = riskColors[level]

  return (
    <div className={`rounded-lg border p-4 ${colors.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-900">{title}</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${colors.text}`}>
            {value}{suffix}
          </div>
          <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
            {riskLabels[level]}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>0%</span>
          <span>5%</span>
          <span>15%</span>
          <span>25%+</span>
        </div>
        <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          {/* Threshold markers */}
          <div className="absolute left-[20%] top-0 w-px h-full bg-slate-400 opacity-50" />
          <div className="absolute left-[60%] top-0 w-px h-full bg-slate-400 opacity-50" />
          
          {/* Progress indicator */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${colors.progress}`}
            style={{ width: `${Math.min(100, (value / 25) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface RiskAnalysisProps {
  /** Percentage of questions answered in <10 seconds */
  rushFactor: number
  /** Accuracy drop between first and second half of session */
  fatigueDropOff: number
  /** Number of topics with no improvement in 2 weeks */
  stagnantTopics: number
  /** Show loading state */
  isLoading?: boolean
}

/**
 * Risk Analysis Component
 * 
 * Displays learning health indicators with visual progress bars
 * and warning alerts when risks are high.
 * 
 * @param rushFactor - Quick answer percentage (0-100)
 * @param fatigueDropOff - Session accuracy decline (0-100)
 * @param stagnantTopics - Count of stuck topics
 * @param isLoading - Loading state
 */
export function RiskAnalysis({
  rushFactor,
  fatigueDropOff,
  stagnantTopics,
  isLoading = false,
}: RiskAnalysisProps) {
  // Determine overall health status
  const rushLevel = getRiskLevel(rushFactor)
  const fatigueLevel = getRiskLevel(fatigueDropOff)
  const hasHighRisk = rushLevel === "critical" || fatigueLevel === "critical" || stagnantTopics >= 5
  const hasWarning = rushLevel === "warning" || fatigueLevel === "warning" || stagnantTopics >= 3
  const isHealthy = !hasHighRisk && !hasWarning

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            Learning Health Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : hasHighRisk ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              Learning Health Check
            </CardTitle>
            <CardDescription>
              Behavioral indicators that may affect exam performance
            </CardDescription>
          </div>
          {isHealthy && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              All Clear
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning Banner */}
        {hasHighRisk && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention Required</AlertTitle>
            <AlertDescription>
              One or more risk indicators are critical. Consider adjusting practice habits 
              or discussing strategies with your child.
            </AlertDescription>
          </Alert>
        )}

        {hasWarning && !hasHighRisk && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Minor Concerns</AlertTitle>
            <AlertDescription className="text-amber-700">
              Some indicators need attention. Monitor these areas over the next few sessions.
            </AlertDescription>
          </Alert>
        )}

        {/* Risk Metrics */}
        <div className="grid gap-4">
          <RiskMetric
            icon={Zap}
            title="Rush Factor"
            value={rushFactor}
            description="Questions answered in under 10 seconds"
            tooltip="High rush factor often indicates guessing. Encourage reading questions carefully and showing working."
          />

          <RiskMetric
            icon={Battery}
            title="Fatigue Drop-off"
            value={fatigueDropOff}
            description="Accuracy decline during sessions"
            tooltip="High fatigue suggests sessions are too long. Try shorter, more frequent practice sessions."
          />

          <RiskMetric
            icon={TrendingDown}
            title="Stagnant Topics"
            value={stagnantTopics}
            description="Topics with no improvement in 2 weeks"
            tooltip="These topics may need a different learning approach, additional resources, or tutor support."
            suffix=""
          />
        </div>

        {/* Recommendations */}
        {(hasHighRisk || hasWarning) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Suggested Actions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {rushFactor > 5 && (
                <li>• Encourage reading each question twice before selecting an answer</li>
              )}
              {fatigueDropOff > 5 && (
                <li>• Split longer sessions into 15-minute focused blocks with breaks</li>
              )}
              {stagnantTopics >= 3 && (
                <li>• Review the stagnant topics below and try different practice methods</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RiskAnalysis
