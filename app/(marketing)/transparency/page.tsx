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
import { Shield, Lock, Eye, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Our Commitment to You | Ember Ascent",
  description: "How we ensure quality education and protect your family's privacy.",
}

export default function TransparencyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Commitment to You</h1>
        <p className="text-lg text-muted-foreground">
          The promises we make to every family using Ember Ascent.
        </p>
      </div>

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
              Last updated: {new Date().toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
