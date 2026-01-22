/**
 * Why Analytics Page
 * 
 * Detailed explanation of how analytics helps parents support their child's
 * exam preparation. Uses real scenarios and neutral language.
 * 
 * @module app/(marketing)/why-analytics/page
 */

import Link from "next/link"
import { ArrowLeft, Sparkles, Target, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Why Analytics Matters | Ember Ascent",
  description: "Understand how analytics helps you support your child's 11+ exam preparation",
}

/**
 * Scenario comparison component
 */
function ScenarioComparison({
  title,
  withoutAnalytics,
  withAnalytics,
  icon: Icon,
  color,
}: {
  title: string
  withoutAnalytics: string
  withAnalytics: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${color} text-white`}>
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6" />
          <CardTitle className="text-white">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Badge variant="outline" className="mb-3">
              Without Analytics
            </Badge>
            <p className="text-slate-600 text-sm leading-relaxed">
              {withoutAnalytics}
            </p>
          </div>
          <div>
            <Badge className="mb-3 bg-blue-600">
              With Analytics
            </Badge>
            <p className="text-slate-600 text-sm leading-relaxed">
              {withAnalytics}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WhyAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why Analytics Matters
          </h1>
          <p className="text-xl text-slate-600">
            How data-informed insights help you support your child's exam preparation
            more effectively
          </p>
        </div>
      </div>

      {/* The Core Difference */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">The Core Difference</CardTitle>
              <CardDescription className="text-base text-slate-700">
                Free tier vs Analytics explained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700">
              <p>
                <strong>With the free tier,</strong> you see <em>what</em> your child practiced:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Total questions answered: 120</li>
                <li>Overall accuracy: 75%</li>
                <li>Current streak: 5 days</li>
                <li>Practice time: 30 minutes</li>
              </ul>

              <p className="pt-4">
                <strong>With analytics,</strong> you see <em>how</em> your child practiced:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Rush factor: 35% of questions answered in under 10 seconds</li>
                <li>Fatigue drop-off: Accuracy drops 40% in the last 5 questions</li>
                <li>Stagnant topics: 3 topics with no improvement in 2 weeks</li>
                <li>Readiness score: 67% (developing, needs focused work)</li>
              </ul>

              <p className="pt-4 text-slate-900 font-medium">
                The difference? Context that helps you have more effective conversations about
                practice strategy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real Scenarios */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Real Scenarios
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See how analytics provides actionable insights in common situations
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            <ScenarioComparison
              title="Scenario 1: Emma practices regularly but scores vary"
              withoutAnalytics="You see Emma answered 30 questions with 60% accuracy. You encourage her to keep practicing and maybe slow down."
              withAnalytics="Analytics shows a 35% rush factor—Emma is guessing on many questions. You have a specific conversation about taking time to think through problems, leading to better accuracy."
              icon={AlertTriangle}
              color="bg-amber-500"
            />

            <ScenarioComparison
              title="Scenario 2: Oliver seems tired during practice"
              withoutAnalytics="Oliver says he's tired. You're not sure if it's practice fatigue or just the time of day. You might reduce session length."
              withAnalytics="Analytics shows a 60% fatigue drop-off—Oliver's accuracy falls from 90% to 30% after question 15. You adjust to shorter, more frequent sessions with breaks."
              icon={TrendingUp}
              color="bg-red-500"
            />

            <ScenarioComparison
              title="Scenario 3: Sophie has been practicing for months"
              withoutAnalytics="You see Sophie has answered 500 questions total with 78% accuracy. You feel she's making progress but aren't sure about exam readiness."
              withAnalytics="Analytics shows an 85% readiness score with strong coverage across most topics, but identifies 2 weak areas in verbal reasoning. You focus practice on those specific topics."
              icon={Target}
              color="bg-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Who Benefits Most */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Who Benefits Most from Analytics?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                  Good Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>You review practice sessions with your child</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>You want to guide practice strategy, not just provide access</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>You value data-informed decisions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>You're actively involved in exam preparation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>You want early visibility into potential issues</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="h-5 w-5" />
                  May Not Need It
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-slate-400">○</span>
                    <span>You prefer your child practices independently</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-400">○</span>
                    <span>You're satisfied with basic progress tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-400">○</span>
                    <span>You rely on tutors for detailed guidance</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-400">○</span>
                    <span>You don't need visibility into practice habits</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-400">○</span>
                    <span>You're comfortable making decisions without data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* What You're NOT Getting */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-slate-300">
              <CardHeader>
                <CardTitle className="text-2xl">What Analytics Is NOT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p className="flex gap-2">
                  <span className="text-slate-400">✗</span>
                  <span>
                    <strong>Not a guarantee of exam success.</strong> Analytics provides insights,
                    but results depend on many factors including effort, consistency, and starting level.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="text-slate-400">✗</span>
                  <span>
                    <strong>Not a replacement for practice.</strong> No amount of data changes
                    the fact that improvement requires consistent practice.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="text-slate-400">✗</span>
                  <span>
                    <strong>Not a tutor substitute.</strong> Analytics shows patterns; it doesn't
                    teach concepts or provide 1-on-1 instruction.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="text-slate-400">✗</span>
                  <span>
                    <strong>Not essential for all families.</strong> Many children succeed with
                    just practice access and parental observation.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Try Free First
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Start with unlimited practice and basic progress tracking. Upgrade to analytics
            when you're ready for deeper insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Practice
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Compare Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
