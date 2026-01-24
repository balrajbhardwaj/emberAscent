/**
 * Explainability Showcase Component
 * 
 * Marketing component showcasing AI-powered explanations
 * with three different learning styles.
 * Designed for landing page with Ember Ascent branding.
 * 
 * @module components/marketing/ExplainabilityShowcase
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Brain, Eye, BookOpen } from 'lucide-react'

type ExplanationMode = 'steps' | 'visual' | 'example'

export function ExplainabilityShowcase() {
  const [activeMode, setActiveMode] = useState<ExplanationMode>('steps')

  const modes = {
    steps: {
      icon: Brain,
      title: 'Step-by-Step',
      subtitle: 'Clear sequential guidance',
      color: 'orange',
      gradient: 'from-orange-500 to-amber-600',
      content: (
        <div className="space-y-4">
          {[
            'Start with 47 blocks',
            'We need to subtract 26',
            'Take away 2 tens (20) and 6 ones',
            'Count what remains: 21'
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 animate-in slide-in-from-left" style={{ animationDelay: `${idx * 200}ms`, animationDuration: '500ms' }}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                {idx + 1}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-lg text-slate-700 leading-relaxed">{step}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    visual: {
      icon: Eye,
      title: 'Visual Diagram',
      subtitle: 'See it with colored blocks',
      color: 'orange',
      gradient: 'from-orange-500 to-amber-600',
      content: (
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 rounded-2xl border-2 border-orange-200 shadow-inner animate-in fade-in slide-in-from-bottom" style={{ animationDuration: '600ms' }}>
          <pre className="text-lg leading-loose font-mono text-slate-800">
{`🟦🟦🟦🟦 🟦🟦🟦🟦 🟦🟦  🔴🔴🔴🔴🔴🔴🔴
(4 tens + 7 ones = 47)

Take away 26:
🟦🟦 🟦🟦🟦🟦 (2 tens + 6 ones)

Cross out what we subtract:
🟦🟦❌❌ 🟦🟦🟦🟦 ❌❌❌❌❌❌ 🔴

What's left:
🟦🟦 🔴 = 2 tens + 1 one = 21 ✨`}
          </pre>
        </div>
      )
    },
    example: {
      icon: BookOpen,
      title: 'Worked Example',
      subtitle: 'Learn by comparison',
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      content: (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom" style={{ animationDuration: '600ms' }}>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
            <p className="text-xl font-bold text-orange-700 mb-4">Problem: 🔵 56 - 🟢 32</p>
            <div className="space-y-3 text-lg">
              <p className="text-slate-700"><span className="font-semibold text-blue-600">🔵 Step 1:</span> Start with 56</p>
              <p className="text-slate-700"><span className="font-semibold text-green-600">🟢 Step 2:</span> Subtract 32</p>
              <p className="text-slate-700"><span className="font-semibold text-orange-600">Step 3:</span> 5 tens - 3 tens = 2 tens</p>
              <p className="text-slate-700"><span className="font-semibold text-orange-600">Step 4:</span> 6 ones - 2 ones = 4 ones</p>
              <p className="text-xl font-bold text-amber-700 mt-4 pt-4 border-t-2 border-amber-300">Answer: 24 🎯</p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 italic">
            Same method as your question - just different numbers!
          </p>
        </div>
      )
    }
  }

  const active = modes[activeMode]
  const ActiveIcon = active.icon

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Three Ways to Understand
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Every child learns differently. Our AI explains concepts in multiple ways
            until it clicks.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {(Object.keys(modes) as ExplanationMode[]).map((mode) => {
            const ModeIcon = modes[mode].icon
            const isActive = activeMode === mode
            return (
              <Button
                key={mode}
                onClick={() => setActiveMode(mode)}
                variant={isActive ? 'default' : 'outline'}
                size="lg"
                className={`
                  transition-all duration-300 px-6 py-6 text-lg
                  ${isActive 
                    ? `bg-gradient-to-r ${modes[mode].gradient} text-white shadow-lg scale-105` 
                    : 'hover:scale-105 hover:border-orange-300'
                  }
                `}
              >
                <ModeIcon className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-bold">{modes[mode].title}</div>
                  <div className={`text-xs ${isActive ? 'text-white/90' : 'text-slate-500'}`}>
                    {modes[mode].subtitle}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Content Display */}
        <Card className="max-w-4xl mx-auto p-8 md:p-12 shadow-2xl border-2 border-orange-100 bg-white/80 backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${active.gradient} shadow-lg`}>
              <ActiveIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{active.title}</h3>
              <p className="text-slate-600">{active.subtitle}</p>
            </div>
          </div>
          
          <div className="mt-8">
            {active.content}
          </div>
        </Card>

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: '🎯',
              title: 'Instant Clarity',
              description: 'No more "I don\'t get it" - AI adapts to your child\'s learning style'
            },
            {
              icon: '🧠',
              title: 'Deep Understanding',
              description: 'Not just answers - build real mathematical thinking skills'
            },
            {
              icon: '⚡',
              title: 'Always Available',
              description: 'Like having a patient tutor 24/7, explaining in fresh ways'
            }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="text-center p-6 rounded-xl bg-white/60 backdrop-blur border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-lg text-slate-800 mb-2">{feature.title}</h4>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
