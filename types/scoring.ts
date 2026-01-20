/**
 * Ember Score Types
 * 
 * Types for the Ember Score transparency system.
 * Ember Score (0-100) indicates content quality and trustworthiness.
 * 
 * @module types/scoring
 */

export type ScoreTier = 'verified' | 'confident' | 'draft'

export type ReviewStatus = 'reviewed' | 'spot_checked' | 'ai_only'

export interface EmberScoreBreakdown {
  curriculumAlignment: number // 0-40 points
  expertVerification: number // 0-40 points
  communityFeedback: number // 0-20 points
}

export interface EmberScoreResult {
  score: number // 0-100
  breakdown: EmberScoreBreakdown
  tier: ScoreTier
  lastCalculated: Date
}

export interface ReviewInfo {
  status: ReviewStatus
  reviewerId?: string
  reviewDate?: Date
}

export interface QuestionForScoring {
  id: string
  curriculumReference?: string | null
  reviewStatus?: ReviewStatus | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  
  // Community feedback stats (from aggregated data)
  totalAttempts?: number
  errorReportCount?: number
  helpfulVotes?: number
  notHelpfulVotes?: number
}

export interface CommunityStats {
  totalAttempts: number
  errorReportCount: number // unresolved reports
  helpfulVotes: number
  notHelpfulVotes: number
}
