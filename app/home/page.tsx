import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Brain,
  Clock,
  Shield,
  Zap,
  Target,
  Sparkles,
  Flame,
} from "lucide-react"
import { ExplainabilityShowcase } from "@/components/marketing/ExplainabilityShowcase"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Ember Ascent</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Pricing</Link>
            <Link href="/transparency" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Transparency</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-violet-600 mr-2"></span>
                Now available for Year 4 & 5
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl mb-6">
                The 11 Exam. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  Democratised.
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
                Unlimited adaptive practice for every child, completely free.
                Professional-grade analytics for parents who want deeper oversight.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:scale-105"
                >
                  Start Practising Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  View Ascent Analytics
                </Link>
              </div>
            </div>
          </div>
          
          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[1000px] opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-200 via-transparent to-transparent blur-3xl"></div>
        </section>

        {/* Trust Strip */}
        <section className="border-y border-slate-100 bg-slate-50/50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 text-slate-500 grayscale opacity-70">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">ICO Children's Code Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">5,000 Verified Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">Adaptive AI Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">National Curriculum Aligned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything they need to succeed.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Built to make practice engaging for them and transparent for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2 h-auto md:h-[600px]">
              {/* Large Card: Adaptive Engine */}
              <div className="group relative overflow-hidden rounded-3xl bg-slate-50 p-8 md:col-span-2 md:row-span-2 border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-violet-100 blur-3xl opacity-50 transition-opacity group-hover:opacity-100"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Adaptive Learning Engine</h3>
                    <p className="text-slate-600 max-w-md">
                      Our algorithm adjusts difficulty in real-time based on your child's performance. 
                      It identifies weak spots and serves the right questions to build mastery without frustration.
                    </p>
                  </div>
                  <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full w-3/4 bg-violet-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-violet-600">Optimizing...</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Foundation</span>
                      <span className="font-bold text-slate-900">Standard</span>
                      <span>Challenge</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Card: Quick Byte */}
              <div className="group relative overflow-hidden rounded-3xl bg-slate-50 p-8 border border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Byte™</h3>
                <p className="text-sm text-slate-600">
                  Daily 4-question micro-sessions designed to build consistency streaks without burnout.
                </p>
              </div>

              {/* Medium Card: Mock Tests */}
              <div className="group relative overflow-hidden rounded-3xl bg-slate-50 p-8 border border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Mock Tests</h3>
                <p className="text-sm text-slate-600">
                  Full-length timed exams that simulate real conditions. Available in Standard, Maths, and English formats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Value Gap */}
        <section id="pricing" className="bg-slate-900 py-24 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Free for them. Insightful for you.
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                We believe quality education should be accessible. That's why the learning is free.
                We charge only for the advanced analytics that help you guide them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="rounded-3xl bg-slate-800/50 p-8 border border-slate-700 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold text-white">Student Basic</h3>
                  <span className="text-2xl font-bold text-white">£0<span className="text-sm text-slate-400 font-normal">/mo</span></span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Unlimited Practice Questions</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Adaptive Difficulty Engine</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Daily "Quick Byte" Streaks</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Basic Progress Tracking</span>
                  </li>
                </ul>
                <Link href="/signup" className="block w-full rounded-xl bg-slate-700 py-3 text-center font-semibold text-white hover:bg-slate-600 transition-colors">
                  Get Started Free
                </Link>
              </div>

              {/* Paid Tier */}
              <div className="relative rounded-3xl bg-gradient-to-b from-violet-600 to-indigo-700 p-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Most Popular
                </div>
                <div className="h-full rounded-[22px] bg-slate-900/90 p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      Ascent Analytics
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    </h3>
                    <span className="text-2xl font-bold text-white">£14.99<span className="text-sm text-slate-400 font-normal">/mo</span></span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span>Weakness Heatmaps</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span>Mock Test Exam Simulation</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span>Detailed Session History</span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                      <span>Readiness Score Prediction</span>
                    </li>
                  </ul>
                  <Link href="/signup?tier=ascent" className="block w-full rounded-xl bg-white py-3 text-center font-semibold text-violet-700 hover:bg-slate-100 transition-colors">
                    Upgrade to Ascent
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explainability Showcase (Existing) */}
        <ExplainabilityShowcase />

        {/* Footer */}
        <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-600 text-white">
                    <Flame className="h-3 w-3 fill-current" />
                  </div>
                  <span className="text-lg font-bold text-slate-900">Ember Ascent</span>
                </div>
                <p className="text-sm text-slate-500">
                  Democratising 11 preparation with adaptive AI and professional analytics.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="#features" className="hover:text-violet-600">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-violet-600">Pricing</Link></li>
                  <li><Link href="/signup" className="hover:text-violet-600">Get Started</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/about" className="hover:text-violet-600">About Us</Link></li>
                  <li><Link href="/transparency" className="hover:text-violet-600">Transparency</Link></li>
                  <li><Link href="/contact" className="hover:text-violet-600">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/privacy" className="hover:text-violet-600">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-violet-600">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-violet-600">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Ember Ascent. All rights reserved.
              </p>
              <div className="flex gap-4">
                {/* Social icons could go here */}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
