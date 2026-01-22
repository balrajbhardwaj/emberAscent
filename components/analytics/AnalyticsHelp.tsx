/**
 * Analytics Help Modal
 * 
 * A "How to read this dashboard" guide that explains all metrics.
 * Uses a slide-over panel for better UX on the analytics page.
 * 
 * Sections:
 * - KPIs: Readiness Score, Ascent Score, Velocity
 * - KRIs: Rush Factor, Fatigue Drop-off
 * - Heatmap: Color coding explanation
 * 
 * @module components/analytics/AnalyticsHelp
 */
"use client"

import { useState } from "react"
import {
  HelpCircle,
  Target,
  TrendingUp,
  Zap,
  AlertTriangle,
  Battery,
  BookOpen,
  X,
  ChevronRight,
  Gauge,
  Activity,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/**
 * Individual metric explanation card
 */
function MetricCard({
  icon: Icon,
  title,
  description,
  example,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  example?: string
  color: string
}) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      {example && (
        <div className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 italic">
          Example: {example}
        </div>
      )}
    </div>
  )
}

/**
 * Color legend item
 */
function ColorLegend({
  color,
  label,
  meaning,
}: {
  color: string
  label: string
  meaning: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded ${color}`} />
      <div>
        <span className="font-medium text-slate-900">{label}</span>
        <span className="text-slate-500 ml-2">— {meaning}</span>
      </div>
    </div>
  )
}

interface AnalyticsHelpProps {
  /** Trigger button variant */
  variant?: "icon" | "button"
}

/**
 * Analytics Help Component
 * 
 * Renders a help button that opens a slide-over panel with
 * comprehensive explanations of all dashboard metrics.
 * 
 * @param variant - Display as icon-only or full button
 */
export function AnalyticsHelp({ variant = "button" }: AnalyticsHelpProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <HelpCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            How to Read
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Understanding Your Dashboard
          </SheetTitle>
          <SheetDescription>
            Learn what each metric means and how to use this data to support your child's learning.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* KPIs Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                KPIs
              </Badge>
              <h3 className="font-semibold text-slate-900">Key Performance Indicators</h3>
            </div>
            <p className="text-sm text-slate-600">
              These metrics show how well your child is performing and progressing.
            </p>

            <div className="space-y-3">
              <MetricCard
                icon={Target}
                title="Readiness Score"
                description="A composite score (0-100) indicating how prepared your child is for the 11+ exam. It combines accuracy, topic coverage, and consistency."
                example="85% means your child is well-prepared with minor gaps to address."
                color="bg-emerald-500"
              />

              <MetricCard
                icon={BarChart3}
                title="Ascent Score"
                description="A weighted mastery score that gives more importance to harder questions and challenging topics. Shows true understanding depth."
                example="70 Ascent Score with 80% accuracy means they're tackling harder questions."
                color="bg-blue-500"
              />

              <MetricCard
                icon={Zap}
                title="Velocity"
                description="The learning pace measured in questions per week or mastery points gained. Helps track if progress is consistent or stalling."
                example="+15 velocity means 15 more correct answers this week vs last week."
                color="bg-purple-500"
              />
            </div>
          </section>

          <Separator />

          {/* KRIs Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                KRIs
              </Badge>
              <h3 className="font-semibold text-slate-900">Key Risk Indicators</h3>
            </div>
            <p className="text-sm text-slate-600">
              These metrics help identify opportunities to optimize practice habits for better results.
            </p>

            <div className="space-y-3">
              <MetricCard
                icon={AlertTriangle}
                title="Rush Factor"
                description="Percentage of questions answered in under 10 seconds. Taking time to think through problems leads to better accuracy and understanding."
                example="15% rush factor is concerning — encourage taking more time."
                color="bg-amber-500"
              />

              <MetricCard
                icon={Battery}
                title="Fatigue Drop-off"
                description="How much accuracy decreases between the first half and second half of a practice session. High values suggest mental tiredness."
                example="20% drop-off means accuracy fell from 80% to 60% mid-session."
                color="bg-red-500"
              />

              <MetricCard
                icon={Activity}
                title="Stagnant Topics"
                description="Number of topics where no improvement has been made in the last 2 weeks despite practice. May need different learning approach."
                example="3 stagnant topics means 3 areas need extra attention or tutoring."
                color="bg-slate-500"
              />
            </div>
          </section>

          <Separator />

          {/* Heatmap Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Heatmap
              </Badge>
              <h3 className="font-semibold text-slate-900">Color Coding Guide</h3>
            </div>
            <p className="text-sm text-slate-600">
              The performance heatmap uses colors to celebrate strengths and identify areas of improvement.
            </p>

            <div className="space-y-3 text-sm">
              <ColorLegend
                color="bg-emerald-500"
                label="Green (80%+)"
                meaning="Strong mastery—keep up the great work!"
              />
              <ColorLegend
                color="bg-amber-500"
                label="Yellow (60-79%)"
                meaning="Good progress—opportunity to strengthen further"
              />
              <ColorLegend
                color="bg-red-500"
                label="Red (<60%)"
                meaning="Weak area, prioritize for focused study"
              />
              <ColorLegend
                color="bg-slate-200"
                label="Gray"
                meaning="Not enough data to assess"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Click on any cell in the heatmap to see detailed performance 
                breakdown and get specific practice recommendations.
              </p>
            </div>
          </section>

          <Separator />

          {/* Quick Tips */}
          <section className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-slate-600" />
              Quick Tips for Parents
            </h3>
            
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Focus on <strong>red topics first</strong> — these have the biggest impact on overall score.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>If Rush Factor is high, encourage your child to <strong>read questions twice</strong> before answering.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>High Fatigue? Try <strong>shorter, more frequent</strong> practice sessions.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Celebrate <strong>velocity improvements</strong> — consistency matters more than perfection.</span>
              </li>
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AnalyticsHelp
