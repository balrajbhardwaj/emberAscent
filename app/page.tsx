import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, BarChart3, Target, ArrowRight } from "lucide-react"
import { ExplainabilityShowcase } from "@/components/marketing/ExplainabilityShowcase"

export default function LandingPage() {
  // Redirect to /home as the main landing page
  redirect("/home")
  
  // Legacy page kept for reference - not reached due to redirect
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-4xl text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Ember Ascent
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            UK 11+ Exam Preparation for Year 4-5 Students
          </p>
          <p className="mb-12 text-lg text-gray-700">
            Free learning content for all children. Practice questions aligned
            with National Curriculum objectives.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            For Every Child, Every Family
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Free for Everyone
              </h3>
              <p className="text-gray-600">
                Unlimited practice questions across Verbal Reasoning, English, and Maths.
                No credit card required.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Curriculum Aligned
              </h3>
              <p className="text-gray-600">
                Every question tagged with National Curriculum objectives and difficulty levels.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Optional Analytics
              </h3>
              <p className="text-gray-600">
                Upgrade when you want deeper insights to guide your child's preparation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explainability Showcase */}
      <ExplainabilityShowcase />

      {/* Analytics Teaser */}
      <div className="px-8 py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to Guide Practice More Effectively?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            See how your child practices, not just how much. Identify patterns like rushing,
            fatigue, or topics that need attention.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Compare Free vs Premium Features
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Transparency */}
      <div className="px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment to Transparency
          </h2>
          <p className="text-gray-600 mb-6">
            We believe families should understand exactly what they're getting and why.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/transparency"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Our Transparency Principles
            </Link>
            <Link
              href="/how-questions-are-made"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              How Questions Are Made
            </Link>
            <Link
              href="/why-analytics"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Why Analytics Matters
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
