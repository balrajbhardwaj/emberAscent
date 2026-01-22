/**
 * How Questions Are Made - Trust & Transparency Landing Page
 * 
 * Explains the Ascent Trust Level system and what trust means
 * for educational content without revealing proprietary details.
 * 
 * Features:
 * - Animated handshake illustration
 * - Trust tier explanation
 * - Transparency commitment
 * 
 * @module app/(marketing)/how-questions-are-made
 */

import { Metadata } from "next"
import Link from "next/link"
import { Shield, CheckCircle, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MarketingNav } from "@/components/common/MarketingNav"

export const metadata: Metadata = {
  title: "How Questions Are Made | Ember Ascent",
  description: "Discover how Ember Ascent creates trustworthy educational content with complete transparency.",
}

export default function HowQuestionsAreMadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-green-50/20">
      <MarketingNav />
      
      {/* Hero Section with Handshake Animation */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background Pattern - Transparency Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating Elements for Transparency Theme */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-slate-200/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />

        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Built on <span className="text-blue-600">Trust</span> &{" "}
              <span className="text-green-600">Transparency</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every question your child answers has been crafted with care and validated for quality.
              Here's how we ensure content you can trust.
            </p>
          </div>

          {/* Trust Shield Building Animation */}
          <div className="flex justify-center mb-16">
            <div className="relative flex items-center justify-center">
              {/* Shield SVG */}
              <svg viewBox="0 0 100 120" className="w-48 h-56">
                {/* Shield outline */}
                <path
                  d="M50 5 L90 20 L90 55 Q90 90 50 115 Q10 90 10 55 L10 20 Z"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                
                {/* Bottom piece - Draft (Grey) */}
                <path
                  d="M50 115 Q10 90 10 55 L10 50 L50 95 L90 50 L90 55 Q90 90 50 115"
                  className="fill-slate-400 animate-shield-bottom"
                />
                
                {/* Middle piece - Confident (Green) */}
                <path
                  d="M10 50 L10 35 L50 65 L90 35 L90 50 L50 95 Z"
                  className="fill-green-500 animate-shield-middle"
                />
                
                {/* Top piece - Verified (Blue) */}
                <path
                  d="M50 5 L90 20 L90 35 L50 65 L10 35 L10 20 Z"
                  className="fill-blue-500 animate-shield-top"
                />
                
                {/* Checkmark */}
                <path
                  d="M35 55 L45 65 L65 45"
                  fill="none"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-checkmark"
                />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full animate-shield-glow" />
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur rounded-full shadow-lg border border-slate-200">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-800">Ascent Trust Level</span>
              <span className="text-slate-500">—</span>
              <span className="text-slate-600">Your guarantee of quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* What Trust Means Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            What Does Trust Mean?
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Our Ascent Trust Level isn't just a number—it's a promise. Each score represents
            layers of validation that ensure your child learns from reliable content.
          </p>

          {/* Trust Tiers */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Verified Tier */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-xl font-bold text-blue-700">90-100</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Verified</h3>
                <p className="text-sm text-slate-600">
                  The highest level of trust. These questions have been reviewed by education
                  experts and validated by the learning community. You can be confident in
                  their accuracy and educational value.
                </p>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Expert reviewed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confident Tier */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-xl font-bold text-green-700">75-89</span>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Confident</h3>
                <p className="text-sm text-slate-600">
                  Strong confidence in quality. These questions have been reviewed or have
                  strong community validation. They meet our rigorous standards for
                  curriculum alignment.
                </p>
                <div className="mt-4 pt-4 border-t border-green-100">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Users className="w-4 h-4" />
                    <span>Community validated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Draft Tier */}
            <Card className="border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-xl font-bold text-slate-700">60-74</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Draft</h3>
                <p className="text-sm text-slate-600">
                  Meets our quality threshold but awaiting full review. These questions are
                  curriculum-aligned and carefully generated, on their journey to becoming
                  fully verified.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Quality checked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Our Commitment to You
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">No Hidden Quality</h3>
                <p className="text-sm text-slate-600">
                  Every question displays its trust level. We don't hide poor quality content—we
                  improve it or remove it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Curriculum Aligned</h3>
                <p className="text-sm text-slate-600">
                  Questions map to UK National Curriculum objectives. We tell you exactly which
                  learning goals each question targets.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Community Powered</h3>
                <p className="text-sm text-slate-600">
                  Feedback from parents, teachers, and learners helps us continuously improve
                  content quality.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Always Improving</h3>
                <p className="text-sm text-slate-600">
                  Trust levels are dynamic. As questions are reviewed and validated, their
                  scores increase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Trusted Learning?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of families who trust Ember Ascent for their child's 11+ preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/signup">
                Start Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              <Link href="/transparency">
                Full Transparency Report
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
