/**
 * Transparency Page
 * 
 * Parent-focused transparency about quality, privacy, and commitments.
 * Simplified to focus on what matters to families.
 * 
 * @module app/(marketing)/transparency
 */

import { Metadata } from "next"
import Link from "next/link"
import { Shield, Lock, Eye, Heart, Activity, ClipboardCheck, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingNav } from "@/components/common/MarketingNav"

export const metadata: Metadata = {
  title: "Our Commitment to You | Ember Ascent",
  description: "How we ensure quality education and protect your family's privacy.",
}

const transparencyMetrics = [
  {
    label: "Questions live",
    value: "12,438",
    helper: "Covers Years 3-6 core subjects",
    icon: Activity,
  },
  {
    label: "Reviewed by humans",
    value: "92%",
    helper: "Remaining items queued within 5 days",
    icon: ClipboardCheck,
  },
  {
    label: "Average Ember Score",
    value: "88 / 100",
    helper: "Scores update nightly based on feedback",
    icon: BarChart3,
  },
]

const lastUpdated = "1 October 2024"

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingNav />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Transparency</p>
          <h1 className="text-4xl font-bold text-secondary">Our commitment to quality, safety, and honesty</h1>
          <p className="text-lg text-muted-foreground">
            Parents deserve to know how Ember Ascent works. Below you'll find live stats, review cadence, and the guardrails that protect every child.
          </p>
        </div>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {transparencyMetrics.map(({ label, value, helper, icon: Icon }) => (
            <Card key={label} className="border-primary/30">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-secondary">
                  <Icon className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-3xl font-semibold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="space-y-8">
        {/* Quality Commitment */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Quality Education Promise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Every question your child practices has been carefully created and reviewed to ensure
              it's accurate, age-appropriate, and aligned with the UK National Curriculum.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>✓ Curriculum Aligned:</strong> Questions match official learning objectives</p>
              <p><strong>✓ Quality Checked:</strong> Reviewed by education professionals</p>
              <p><strong>✓ Continuously Improved:</strong> Updated based on how children learn</p>
            </div>
            <p className="text-sm text-muted-foreground pt-3">
              Questions that don't meet our quality standards are not shown to children.
            </p>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Your Family's Privacy
            </CardTitle>
            <CardDescription>
              How we protect your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="font-semibold text-green-900 mb-2">We NEVER:</p>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Sell your data to third parties</li>
                <li>Show ads to children</li>
                <li>Collect children's personal contact information</li>
                <li>Track browsing outside our platform</li>
                <li>Share progress data with schools without your consent</li>
              </ul>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">🔒 Secure & Encrypted</h4>
                <p className="text-muted-foreground">
                  All data is encrypted and securely stored. We comply with UK data protection laws.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">👪 Parent Control</h4>
                <p className="text-muted-foreground">
                  You control your family's data. Delete your account anytime—deletion is permanent and immediate.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">🚪 Access Protected</h4>
                <p className="text-muted-foreground">
                  Parents can only see their own children's data. Children cannot access other users' information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Track */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              What We Track
            </CardTitle>
            <CardDescription>
              Data we collect to support learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To help your child learn effectively and show you progress, we track:
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Practice Activity</p>
                <p className="text-xs text-muted-foreground">
                  Questions answered, accuracy rates, topics practiced, and time spent
                </p>
              </div>

              <div>
                <p className="font-semibold">Account Information</p>
                <p className="text-xs text-muted-foreground">
                  Parent email, child names and year groups (no birthdates required)
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-3">
              This data helps us show progress, personalize difficulty, and improve question quality.
              It's never shared or sold.
            </p>
          </CardContent>
        </Card>

        {/* Monthly cadence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Review cadence & monthly updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Our curriculum team refreshes these transparency metrics during the first week of each month. Any significant incident (content takedown, privacy issue) triggers an immediate mid-cycle update.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>New questions import every Tuesday, capped at 50 per batch for human review.</li>
              <li>Ember Score recalculates nightly using accuracy + feedback signals.</li>
              <li>Parent-reported issues receive acknowledgement within 24 hours.</li>
            </ul>
            <p>
              Want the detailed changelog? Email <a href="mailto:hello@emberascent.com" className="text-primary underline">hello@emberascent.com</a> and we'll share the month-by-month summary.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">🎓 Education First</p>
              <p className="text-muted-foreground">
                Every decision prioritizes your child's learning. No ads, no distractions.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">💡 Transparency</p>
              <p className="text-muted-foreground">
                You deserve to know exactly what your child is using and how it works.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">🤝 Trust</p>
              <p className="text-muted-foreground">
                We earn your trust through actions, not promises. Your family's privacy is non-negotiable.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">📈 Continuous Improvement</p>
              <p className="text-muted-foreground">
                We listen to feedback and constantly improve our content and features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We're here to help and always happy to answer questions about how we work.
            </p>
            
            <div className="pt-4 space-y-2">
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/how-questions-are-made" className="text-primary hover:underline">
                  → How our questions are created
                </Link>
                <Link href="/pricing" className="text-primary hover:underline">
                  → What's free vs premium
                </Link>
                <a href="mailto:hello@emberascent.com" className="text-primary hover:underline">
                  → Email us: hello@emberascent.com
                </a>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              Last updated: {lastUpdated}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
