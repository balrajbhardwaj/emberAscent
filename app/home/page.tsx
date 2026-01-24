/**
 * Ascent Home Page
 * 
 * Professional landing page with coaching-focused messaging.
 * Emphasises TAG framework, transparency, and parent empowerment.
 * 
 * Product: Ascent (by Ember Data Labs)
 * Key Products: Ascent Score, Ascent TAG, Ascent Compass
 * 
 * @module app/home/page
 */

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Brain,
  Clock,
  Shield,
  Target,
  Flame,
  Play,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Eye,
  Lock,
  Award,
  Compass,
} from "lucide-react"
import { ExplainabilityShowcase } from "@/components/marketing/ExplainabilityShowcase"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Ascent</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#why-ascent" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Why Ascent
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/transparency" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Our Commitment
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Start Coaching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-orange-50/50 via-white to-white"></div>
          
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 mb-6">
                <Shield className="h-3.5 w-3.5" />
                Built for UK families · ICO Children's Code compliant
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                Be the coach your child needs.{" "}
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  We'll be your assistant.
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                11+ exam preparation that puts <strong className="text-slate-900">you in control</strong>. 
                See exactly where your child needs support, with every recommendation explained.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  Start Free — No Card Required
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  See How It Works
                </Link>
              </div>
              
              {/* Social Proof */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-700">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span><strong className="text-slate-700">2,500+</strong> families coaching</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1"><strong className="text-slate-700">4.9</strong> from parents</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip - The Glass Box Promise */}
        <section className="py-8 border-y border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">The Glass Box Promise</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <Eye className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Every score explained</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">10,000+ verified questions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Privacy by design</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Curriculum aligned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Ascent - TAG Framework */}
        <section id="why-ascent" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">The Ascent TAG Framework</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Other platforms are black boxes. <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Ascent is a glass box.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                You deserve to understand how your child is progressing. Our TAG framework ensures complete transparency at every step.
              </p>
            </div>

            {/* TAG Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Trust */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 mb-5">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Trust</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Every question is curriculum-verified. Every recommendation has a clear rationale. 
                  We earn your trust through transparency, not marketing.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ICO Children's Code compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Human-reviewed content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    No hidden algorithms
                  </li>
                </ul>
              </div>

              {/* Auditability */}
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 mb-5">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Auditability</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  See exactly what we see. Every score breakdown, every skill assessment, 
                  every suggested focus area — fully explainable to you.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Ascent Score breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Question-level explanations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Progress trail you can review
                  </li>
                </ul>
              </div>

              {/* Growth */}
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 mb-5">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Growth</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Clear milestones that show real skill development. Not vanity metrics — 
                  actual competency gains mapped to the curriculum.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    Skill mastery tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    Readiness indicators
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    Personalised focus areas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-24 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Your Coaching Toolkit</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Tools that help you guide, not replace you
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Every feature is designed to give you better visibility and your child better practice.
              </p>
            </div>

            {/* Main Feature - Ascent Compass */}
            <div className="mb-6">
              <div className="rounded-2xl bg-slate-900 p-8 sm:p-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-400 mb-4">
                      <Compass className="h-4 w-4" />
                      Ascent Compass
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      Your coaching dashboard
                    </h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      See exactly where your child needs support. Ascent Compass shows you 
                      weakness areas, suggests focus topics, and tracks improvement over time — 
                      so you can coach with confidence.
                    </p>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-400" />
                        Weakness heatmaps by topic
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-400" />
                        Suggested focus areas with rationale
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-400" />
                        Readiness score with clear criteria
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-slate-400">Suggested Focus</span>
                      <span className="text-orange-400 font-medium">This week</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Fractions</span>
                        <span className="text-amber-400 text-sm">Needs practice</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full w-2/5 bg-amber-400 rounded-full"></div>
                      </div>
                      <p className="text-xs text-slate-500">Based on 12 attempts · 42% accuracy · Year 5 curriculum</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Ascent Guide Feature */}
            <div className="mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-8 sm:p-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 mb-4">
                      <Compass className="h-4 w-4" />
                      Ascent Guide
                      <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full ml-1">NEW</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                      Daily coaching in plain English
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      Stop interpreting data. Start coaching. Ascent Guide synthesises your child's 
                      daily progress into clear, actionable guidance — so you know exactly what matters 
                      and what to do next.
                    </p>
                    <ul className="space-y-3 text-slate-700">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-500" />
                        Daily personalised narrative (not raw data)
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-500" />
                        Links behaviour to outcomes (rushing → accuracy)
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-500" />
                        Conversation starters for supportive discussions
                      </li>
                    </ul>
                  </div>
                  {/* Example Guide Card */}
                  <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Compass className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold text-slate-900">Today's Guide</span>
                      </div>
                      <span className="text-xs text-slate-500">Thursday, 24 Jan</span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-slate-800 font-medium">
                        "Emma is progressing well, but rushing is holding back her Maths score."
                      </p>
                      <p className="text-sm text-slate-600">
                        28% of questions were answered in under 5 seconds. Slowing down on 
                        Fractions could improve accuracy by ~15%.
                      </p>
                      <div className="pt-3 border-t border-orange-100">
                        <p className="text-xs text-slate-500 mb-1">💬 Conversation Starter</p>
                        <p className="text-sm text-slate-700 italic">
                          "I noticed you flew through yesterday's quiz — which question made you think the hardest?"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ascent Score */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="inline-flex items-center gap-2 text-orange-600 mb-4">
                  <Award className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Ascent Score</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Quality</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every question rated 60-100. See exactly why — curriculum alignment, difficulty, 
                  and verification status.
                </p>
              </div>

              {/* Smart Practice */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="inline-flex items-center gap-2 text-purple-600 mb-4">
                  <Brain className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Smart Practice</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Sessions</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Practice adapts to your child's level. Challenges when ready, 
                  consolidation when needed.
                </p>
              </div>

              {/* Mock Tests */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="inline-flex items-center gap-2 text-emerald-600 mb-4">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Mock Tests</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Real Conditions</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full-length timed exams that simulate actual 11+ conditions. 
                  Build confidence before the real day.
                </p>
              </div>

              {/* Explanations */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
                  <Lightbulb className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Explanations</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Three Learning Modes</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Step-by-step breakdowns, visual diagrams, and worked examples — 
                  match your child's learning style.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Design Section */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Responsible by Design</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                  Technology that respects your family
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We use smart technology to assist — not replace — your judgement. 
                  Every automated feature has human oversight, clear limitations, 
                  and explainable outputs. You always have the final say.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">ICO Children's Code Compliant</h4>
                      <p className="text-sm text-slate-600">Built from day one with UK children's privacy standards.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Human Oversight Built In</h4>
                      <p className="text-sm text-slate-600">Content is reviewed by educators. Recommendations are explainable.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                      <Lock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Minimal Data, Maximum Privacy</h4>
                      <p className="text-sm text-slate-600">We collect only what's needed. No selling data. Ever.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-6">Our Commitment</h3>
                <div className="space-y-4">
                  {[
                    "Every recommendation comes with a clear 'why'",
                    "You can see and export all your child's data",
                    "No engagement tricks designed to keep children hooked",
                    "Technology assists your coaching — you're always in control",
                    "Questions reviewed by qualified educators",
                    "Transparent about what we can and cannot predict"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 sm:py-24 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Start coaching in three steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Users,
                  title: "Create Your Account",
                  description: "30 seconds to sign up. Add your child's year group and select their target exam type. No payment needed."
                },
                {
                  step: "02", 
                  icon: BookOpen,
                  title: "Your Child Practises",
                  description: "Daily sessions adapt to their level. You'll see exactly what topics they're working on and how they're progressing."
                },
                {
                  step: "03",
                  icon: Compass,
                  title: "You Coach with Clarity",
                  description: "Ascent Compass shows you where to focus. Review their work, understand their gaps, and guide their improvement."
                }
              ].map((item, index) => (
                <div key={index} className="relative bg-white rounded-2xl p-8 border border-slate-200">
                  <span className="absolute top-6 right-6 text-5xl font-bold text-slate-100">{item.step}</span>
                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 mb-5">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-24 bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-2">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Free practice for them. Clear insights for you.
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Quality 11+ preparation shouldn't be a privilege. Practice is free for every child. 
                Upgrade for deeper coaching insights.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Ascent Free</h3>
                  <p className="text-sm text-slate-400">Unlimited practice for every child</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">£0</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited practice questions",
                    "Adaptive difficulty",
                    "Daily streaks & motivation",
                    "Basic progress overview",
                    "Question explanations"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full rounded-lg bg-slate-700 py-3 text-center font-semibold text-white hover:bg-slate-600 transition-colors">
                  Start Free
                </Link>
              </div>

              {/* Paid Tier */}
              <div className="relative rounded-2xl bg-gradient-to-b from-orange-500 to-amber-500 p-[2px]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white uppercase">
                  For Coaches
                </div>
                <div className="h-full rounded-[14px] bg-slate-900 p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      Ascent Compass
                      <Compass className="h-4 w-4 text-amber-400" />
                    </h3>
                    <p className="text-sm text-slate-400">Full coaching toolkit for parents</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">£14.99</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Everything in Free",
                      "Daily Ascent Guide (plain English coaching)",
                      "Weakness heatmaps",
                      "Mock test simulations",
                      "Conversation starters for discussions",
                      "Readiness score & predictions",
                      "Focus recommendations with rationale"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white">
                        <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?tier=compass" className="block w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-center font-semibold text-white hover:opacity-90 transition-opacity">
                    Start Coaching
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explainability Showcase */}
        <ExplainabilityShowcase />

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">Ascent</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-2">
                  Empowering parents to coach their children through 11+ preparation with transparency and confidence.
                </p>
                <p className="text-xs text-slate-500">
                  A product of Ember Data Labs
                </p>
              </div>
              
              {/* Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#why-ascent" className="text-slate-400 hover:text-white transition-colors">Why Ascent</Link></li>
                  <li><Link href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Get Started</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/transparency" className="text-slate-400 hover:text-white transition-colors">Our Commitment</Link></li>
                  <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Ember Data Labs. All rights reserved.
              </p>
              <p className="text-sm text-slate-500">
                ascent.emberdata.co.uk
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
