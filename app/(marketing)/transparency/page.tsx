/**
 * Transparency Report Page
 * 
 * Comprehensive transparency documentation about:
 * - Content creation process
 * - Quality assurance
 * - Ember Score system
 * - Data collection and usage
 * 
 * @module app/(marketing)/transparency
 */

import { Metadata } from "next"
import Link from "next/link"
import { Eye, BarChart3, Users, Flame, GitBranch, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Transparency Report | Ember Ascent",
  description: "Complete transparency about how Ember Ascent creates, validates, and scores educational content.",
}

export default function TransparencyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Transparency Report</h1>
        <p className="text-lg text-muted-foreground">
          Complete openness about our content, processes, and commitments to quality education.
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission Statement */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Our Transparency Commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              At Ember Ascent, we believe parents deserve complete transparency about the educational 
              content their children use. Unlike other platforms that hide quality metrics and content 
              sources, we openly share:
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>How every question is created</li>
              <li>Who reviewed it and when</li>
              <li>How well it's working for other learners</li>
              <li>The exact quality score (Ember Score) for each question</li>
              <li>All licensing and attribution information</li>
            </ul>
            <p className="font-semibold text-foreground">
              Transparency isn't optional for us—it's fundamental to earning your trust.
            </p>
          </CardContent>
        </Card>

        {/* Content Creation Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Content Creation Process
            </CardTitle>
            <CardDescription>
              How questions are made, from generation to publication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">AI Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Questions are generated using Claude 3.5 Sonnet (Anthropic) with specific prompts 
                    aligned to UK National Curriculum objectives. The AI creates the question text, 
                    multiple choice options, and detailed explanations.
                  </p>
                  <Badge variant="outline" className="mt-2">Initial Ember Score: 26-40</Badge>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Quality Check</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated validation checks curriculum alignment, appropriate difficulty level, 
                    and answer correctness. Questions that fail these checks are flagged for manual review.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Expert Review (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    UK-qualified teachers review questions for accuracy, age-appropriateness, and 
                    curriculum alignment. Expert-reviewed questions receive significantly higher Ember Scores.
                  </p>
                  <Badge variant="outline" className="mt-2">Score increase: +15 to +30 points</Badge>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Publication</h4>
                  <p className="text-sm text-muted-foreground">
                    Questions with an Ember Score of 60 or higher are published and made available to 
                    learners. Lower-scoring questions remain in draft until improved.
                  </p>
                  <Badge variant="outline" className="mt-2">Minimum: 60/100</Badge>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Continuous Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    As children practice, we track success rates, time taken, and error reports. 
                    This community feedback automatically updates the Ember Score. Questions that drop 
                    below 60 are automatically unpublished.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ember Score System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Ember Score Transparency
            </CardTitle>
            <CardDescription>
              Our quality metric (0-100) visible on every question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Every question displays its Ember Score—a transparent quality indicator calculated from:
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border-l-4 border-l-green-500 bg-muted p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold">Curriculum Alignment</p>
                  <Badge>40%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Does the question match valid UK National Curriculum objectives?
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-l-blue-500 bg-muted p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold">Expert Verification</p>
                  <Badge>40%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Has a qualified teacher reviewed and approved this question?
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-l-amber-500 bg-muted p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold">Community Feedback</p>
                  <Badge>20%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  How are learners performing? Are there error reports?
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You can click any Ember Score badge to see the complete breakdown, question history, 
              and who created or reviewed it.
            </p>

            <Link 
              href="/attribution" 
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Learn more about Ember Score →
            </Link>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data We Collect
            </CardTitle>
            <CardDescription>
              What we track and why
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To provide personalized learning and improve content quality, we collect:
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Practice Data</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Which questions were answered and whether answers were correct</li>
                  <li>Time taken to complete questions</li>
                  <li>Topics and difficulty levels practiced</li>
                  <li>Session duration and frequency</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Why:</strong> To track progress, identify weak areas, and personalize difficulty
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Quality Feedback</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Error reports submitted by users</li>
                  <li>Helpful/not helpful votes on explanations</li>
                  <li>NPS survey responses</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Why:</strong> To improve content quality and update Ember Scores
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Account Information</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Parent email and name</li>
                  <li>Child names and year groups (no date of birth required)</li>
                  <li>Subscription status</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Why:</strong> To provide access and billing
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
              <p className="font-semibold text-green-900 mb-1">✓ We NEVER collect:</p>
              <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                <li>Children's personal contact information</li>
                <li>School names or addresses</li>
                <li>Precise geolocation data</li>
                <li>Data from other apps or websites</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              How we protect your family's data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">🔒 Encryption</h4>
                <p className="text-xs text-muted-foreground">
                  All data is encrypted in transit (HTTPS) and at rest. Passwords are hashed and never 
                  stored in plain text.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">🚪 Access Control</h4>
                <p className="text-xs text-muted-foreground">
                  Parents can only access data for their own children. Children cannot access other 
                  children's data. Staff access is logged and audited.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">🗑️ Data Deletion</h4>
                <p className="text-xs text-muted-foreground">
                  You can delete your account and all associated data at any time from Settings. 
                  Deletion is permanent and immediate.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">🛡️ GDPR Compliance</h4>
                <p className="text-xs text-muted-foreground">
                  We comply with GDPR and UK data protection laws. You have rights to access, correct, 
                  or delete your data. Contact us for data export.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Parties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Third-Party Services
            </CardTitle>
            <CardDescription>
              External services we use and why
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Supabase (Database & Authentication)</p>
                <p className="text-xs text-muted-foreground">
                  Stores all user data and handles authentication. GDPR compliant, EU servers available.
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Stripe (Payments)</p>
                <p className="text-xs text-muted-foreground">
                  Processes subscription payments. We never see or store full credit card numbers.
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Resend (Emails)</p>
                <p className="text-xs text-muted-foreground">
                  Sends transactional emails (password resets, weekly reports). No marketing emails 
                  without explicit consent.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Transparency Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We'll update this transparency report as we add new features, data collection practices, 
              or partnerships. Major changes will be announced via email.
            </p>
            
            <div className="text-sm">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-semibold">Questions or concerns?</p>
              <div className="flex gap-4 text-sm">
                <Link href="/contact" className="text-primary underline">
                  Contact us
                </Link>
                <Link href="/attribution" className="text-primary underline">
                  View attribution
                </Link>
                <a href="mailto:privacy@emberascent.com" className="text-primary underline">
                  privacy@emberascent.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
