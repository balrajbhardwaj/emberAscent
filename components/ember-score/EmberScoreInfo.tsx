/**
 * Ember Score Info Modal
 * 
 * Educational modal explaining what Ember Score is and why transparency matters.
 * Written in parent-accessible language.
 * 
 * @module components/ember-score/EmberScoreInfo
 */
"use client"

import { X, Flame, CheckCircle, Users, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EmberScoreInfoProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * EmberScoreInfo - Educational modal about the Ember Score system
 * 
 * Explains:
 * - What Ember Score is
 * - How it's calculated
 * - Why transparency matters
 * - Our commitment to quality
 */
export function EmberScoreInfo({ isOpen, onClose }: EmberScoreInfoProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" fill="currentColor" />
              <DialogTitle className="text-2xl font-bold">
                Understanding Ember Score
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* What is Ember Score */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              What is Ember Score?
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>
                The <strong className="text-foreground">Ember Score</strong> (0-100) is our 
                transparency badge that shows you exactly how trustworthy and high-quality 
                each question is.
              </p>
              <p>
                Unlike other platforms that hide their quality metrics, we believe parents 
                deserve to know where content comes from and how it&apos;s validated.
              </p>
              <div className="rounded-lg bg-muted p-4 mt-3 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex gap-1 mt-1">
                    <Flame className="h-4 w-4 text-green-600" fill="currentColor" />
                    <Flame className="h-4 w-4 text-green-600" fill="currentColor" />
                    <Flame className="h-4 w-4 text-green-600" fill="currentColor" />
                  </div>
                  <div>
                    <strong className="text-foreground">90-100: Verified</strong>
                    <p className="text-xs">Expert reviewed with strong community validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex gap-1 mt-1">
                    <Flame className="h-4 w-4 text-amber-600" fill="currentColor" />
                    <Flame className="h-4 w-4 text-amber-600" fill="currentColor" />
                  </div>
                  <div>
                    <strong className="text-foreground">75-89: Confident</strong>
                    <p className="text-xs">Reviewed or well-validated by the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex gap-1 mt-1">
                    <Flame className="h-4 w-4 text-slate-600" fill="currentColor" />
                  </div>
                  <div>
                    <strong className="text-foreground">60-74: Draft</strong>
                    <p className="text-xs">AI-generated, meets quality threshold</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How is it calculated */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              How is it Calculated?
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Each question&apos;s score is calculated from three components:
              </p>
              
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-green-900">1. Curriculum Alignment</strong>
                    <Badge className="bg-green-600 text-white">40%</Badge>
                  </div>
                  <p className="text-xs text-green-800">
                    Does the question match UK National Curriculum objectives? Questions 
                    with valid NC references score higher.
                  </p>
                </div>

                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-blue-900">2. Expert Verification</strong>
                    <Badge className="bg-blue-600 text-white">40%</Badge>
                  </div>
                  <p className="text-xs text-blue-800">
                    Has an education expert reviewed this question? Fully reviewed questions 
                    score 40 points, spot-checked score 25, AI-only score 10.
                  </p>
                </div>

                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-amber-900">3. Community Feedback</strong>
                    <Badge className="bg-amber-600 text-white">20%</Badge>
                  </div>
                  <p className="text-xs text-amber-800">
                    What do other learners think? Questions with error reports score lower, 
                    questions with helpful votes and successful practice attempts score higher.
                  </p>
                </div>
              </div>

              <p className="text-xs italic">
                The score updates automatically as more children practice and experts review.
              </p>
            </div>
          </section>

          {/* Why transparency matters */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Why Transparency Matters
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>
                As parents, you&apos;re trusting us with your child&apos;s education. 
                That&apos;s a responsibility we take seriously.
              </p>
              <p>
                By showing you exactly how each question is made, reviewed, and validated, 
                we give you the confidence to trust our content—or the information to 
                choose differently.
              </p>
              <p>
                <strong className="text-foreground">We only serve questions scoring 60 or above.</strong> If 
                a question falls below that threshold (usually due to error reports), 
                it&apos;s automatically removed from practice sessions until it&apos;s fixed.
              </p>
            </div>
          </section>

          {/* Our commitment */}
          <section className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-6">
            <h3 className="text-lg font-semibold mb-3 text-orange-900">
              Our Commitment to Quality
            </h3>
            <div className="space-y-2 text-sm text-orange-800">
              <p>
                ✓ <strong>AI + Human:</strong> We use Claude AI to generate questions, 
                then education experts review them for accuracy
              </p>
              <p>
                ✓ <strong>Curriculum-aligned:</strong> All questions map to UK National 
                Curriculum objectives
              </p>
              <p>
                ✓ <strong>Continuously improving:</strong> Scores update based on real 
                practice data and community feedback
              </p>
              <p>
                ✓ <strong>Fully transparent:</strong> You can see exactly how each question 
                is made and validated
              </p>
            </div>
          </section>

          {/* Close button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Badge component import (since we're using it in this file)
 */
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
