/**
 * Pricing & Features Page
 * 
 * Public page showing feature comparison between Free and Ascent tiers.
 * Uses neutral, informative language to help parents make informed decisions.
 * 
 * @module app/(marketing)/pricing/page
 */

import Link from "next/link"
import { Check, Info, Sparkles, BookOpen, BarChart3, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Pricing & Features | Ember Ascent",
  description: "Compare free and premium features for UK 11+ exam preparation",
}

/**
 * Feature list item component
 */
function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <Check
        className={`h-5 w-5 shrink-0 mt-0.5 ${
          included ? "text-emerald-600" : "text-slate-300"
        }`}
      />
      <span className={included ? "text-slate-700" : "text-slate-400"}>
        {text}
      </span>
    </li>
  )
}

/**
 * Pricing card component
 */
function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
  ctaText,
  ctaHref,
}: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  ctaText: string
  ctaHref: string
}) {
  return (
    <Card
      className={`relative ${
        highlighted ? "border-blue-500 border-2 shadow-lg" : ""
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900">{price}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <FeatureItem key={i} text={feature} included={true} />
          ))}
        </ul>
        <Link href={ctaHref} className="block">
          <Button
            className={`w-full ${
              highlighted ? "bg-blue-600 hover:bg-blue-700" : ""
            }`}
            variant={highlighted ? "default" : "outline"}
          >
            {ctaText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

/**
 * Use case card component
 */
function UseCaseCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Ember Ascent</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge variant="outline" className="mb-4">
          Transparent Pricing
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Choose What Works for Your Family
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Start with free unlimited practice. Upgrade when you want deeper insights
          into your child's learning journey.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Foundation"
            price="Free"
            description="Everything your child needs to practice and improve"
            features={[
              "Unlimited practice questions",
              "All subjects: Verbal Reasoning, English, Maths",
              "All difficulty levels",
              "Instant feedback on answers",
              "Question bookmarks",
              "Basic progress tracking",
              "Streak counter and daily goals",
            ]}
            ctaText="Start Free"
            ctaHref="/signup"
          />
          <PricingCard
            name="Ascent"
            price="Coming Soon"
            description="For parents who want to guide their child's preparation strategically"
            features={[
              "Everything in Foundation",
              "Learning Health Check",
              "Exam Readiness Score",
              "Areas of Improvement heatmap",
              "Performance analytics over time",
              "Behavioral insights (rush factor, fatigue)",
              "Personalized recommendations",
            ]}
            highlighted={true}
            ctaText="Join Waitlist"
            ctaHref="/signup"
          />
        </div>
      </div>

      {/* How Analytics Helps Section */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Analytics Helps
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See examples of insights Ascent provides beyond basic practice tracking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <UseCaseCard
              icon={Target}
              title="Identify Patterns Early"
              description="Notice if your child is rushing through questions (40% answered in under 10 seconds) or experiencing fatigue during longer sessions."
              color="bg-emerald-500"
            />
            <UseCaseCard
              icon={BarChart3}
              title="Track Readiness"
              description="Understand how prepared your child is for exam day with a composite score based on accuracy, topic coverage, and consistency."
              color="bg-blue-500"
            />
            <UseCaseCard
              icon={TrendingUp}
              title="Guide Practice Focus"
              description="See which topics haven't improved in 2 weeks, helping you decide where to focus practice time for maximum impact."
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Without Analytics Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <CardTitle>What if I Don't Upgrade?</CardTitle>
              </div>
              <CardDescription>
                Your child continues to have full access to all practice content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600">
              <p>
                <strong className="text-slate-900">With the free tier,</strong> your child can practice
                unlimited questions across all subjects and difficulty levels. You'll see basic
                stats like questions completed and accuracy rates.
              </p>
              <p>
                <strong className="text-slate-900">Without analytics,</strong> you'll rely on your own
                observations to identify areas for improvement. You might notice Emma practices
                regularly, but you won't see that she's rushing 40% of questions or that her
                accuracy drops by 30% in longer sessions.
              </p>
              <p>
                <strong className="text-slate-900">Analytics is most helpful</strong> for parents who
                want to actively guide practice strategy, not just provide access to questions.
                It's about having visibility into <em>how effectively</em> practice time is spent,
                not just <em>how much</em>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is the free tier enough?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Yes! The free tier includes everything your child needs to practice and improve.
                  All questions, all subjects, all difficulties are available. Analytics is an
                  optional add-on for parents who want detailed insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I switch between tiers?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Yes, you can upgrade to Ascent at any time. If you decide analytics isn't
                  helpful, you can downgrade and keep using the free tier—your practice data
                  stays intact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do you offer refunds?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  When Ascent launches, we'll offer a 14-day money-back guarantee. If analytics
                  doesn't provide value for your family, simply request a refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Who should use analytics?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Analytics is designed for parents who want to actively guide their child's exam
                  preparation. If you're already reviewing practice sessions together and want
                  data to inform those conversations, analytics provides helpful context.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Start with Free, Upgrade When Ready
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Create an account and begin practicing immediately. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/transparency">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn About Our Approach
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 Ember Ascent. Helping families prepare for the 11+ exam.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/transparency" className="hover:text-slate-700">
              Transparency
            </Link>
            <Link href="/how-questions-are-made" className="hover:text-slate-700">
              How Questions Are Made
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
