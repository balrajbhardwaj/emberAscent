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
  curriculumReference: string | null
  reviewStatus: ReviewStatus
  errorReports: Array<{ id: string; report_type: string; status: string; created_at: string }>
  communityStats: CommunityStats
  /** Whether this question is linked to curriculum_objectives table */
  curriculumAligned?: boolean
  /** Whether the curriculum alignment has been validated by an expert */
  alignmentValidated?: boolean
}

export interface CommunityStats {
  helpfulCount: number
  practiceCount: number
}
