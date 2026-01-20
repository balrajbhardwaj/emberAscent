/**
 * Ember Score Calculation Service
 * 
 * Calculates and manages Ember Scores for questions.
 * 
 * The Ember Score (0-100) indicates content quality and trustworthiness:
 * - 90-100: Verified (expert reviewed, high community validation)
 * - 75-89: Confident (reviewed or strong community validation)
 * - 60-74: Draft (AI-generated, minimal validation)
 * 
 * Score Components (Week 2 weights):
 * 1. Curriculum Alignment (40% weight)
 *    - Has valid NC reference: +40
 *    - Has partial reference: +20
 *    - No reference: 0
 * 
 * 2. Expert Verification (40% weight)
 *    - Fully reviewed by expert: +40
 *    - Spot-checked: +25
 *    - AI-generated only: +10
 * 
 * 3. Community Feedback (20% weight)
 *    - Base score: 16
 *    - Adjust based on:
 *      - Error reports: -2 per unresolved report (min 0)
 *      - Helpfulness votes: +0.5 per positive (max +4)
 *      - Usage without issues: +0.1 per 100 attempts (max +4)
 * 
 * @module lib/scoring/emberScore
 */

import type {
  EmberScoreResult,
  EmberScoreBreakdown,
  ScoreTier,
  ReviewStatus,
  QuestionForScoring,
  CommunityStats,
} from '@/types/scoring'

/**
 * Calculate Ember Score for a question
 * 
 * @param question - Question data including metadata and stats
 * @returns Complete score result with breakdown and tier
 * 
 * @example
 * const question = {
 *   id: 'q123',
 *   curriculumReference: 'KS2 English Y5 Vocabulary',
 *   reviewStatus: 'reviewed',
 *   totalAttempts: 500,
 *   errorReportCount: 0,
 *   helpfulVotes: 10
 * }
 * const result = calculateEmberScore(question)
 * console.log(result.score) // e.g., 94
 * console.log(result.tier) // 'verified'
 */
export function calculateEmberScore(question: QuestionForScoring): EmberScoreResult {
  const breakdown: EmberScoreBreakdown = {
    curriculumAlignment: calculateCurriculumScore(question.curriculumReference),
    expertVerification: calculateExpertScore(question.reviewStatus),
    communityFeedback: calculateCommunityScore(question.communityStats || {
      helpfulCount: 0,
      practiceCount: 0,
    }, question.errorReports || []),
  }

  const totalScore = 
    breakdown.curriculumAlignment + 
    breakdown.expertVerification + 
    breakdown.communityFeedback

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown,
    tier: getScoreTier(totalScore),
    lastCalculated: new Date(),
  }
}

/**
 * Calculate curriculum alignment score (0-40 points)
 * 
 * @param curriculumReference - National Curriculum reference string
 * @returns Score from 0 to 40
 */
function calculateCurriculumScore(curriculumReference?: string | null): number {
  if (!curriculumReference || curriculumReference.trim() === '') {
    return 0
  }

  // Check if it's a valid-looking curriculum reference
  // Valid format examples: "KS2 English Y5", "Y6 Maths Number", etc.
  const validPattern = /^(KS[1-4]|Y[3-6]|Year [3-6])/i
  const isValid = validPattern.test(curriculumReference)

  if (isValid) {
    return 40 // Full points for valid NC reference
  } else {
    return 20 // Partial points for some reference provided
  }
}

/**
 * Calculate expert verification score (0-40 points)
 * 
 * @param reviewStatus - Review status from expert review
 * @returns Score from 0 to 40
 */
function calculateExpertScore(reviewStatus?: ReviewStatus | null): number {
  switch (reviewStatus) {
    case 'reviewed':
      return 40 // Fully reviewed by expert
    case 'spot_checked':
      return 25 // Quick verification
    case 'ai_only':
    case null:
    case undefined:
      return 10 // AI-generated baseline
    default:
      return 10
  }
}

/**
 * Calculate community feedback score (0-20 points)
 * 
 * Base score: 16 points
 * Adjustments:
 * - Error reports: -2 per unresolved report
 * - Helpful votes: +0.5 per vote (max +4)
 * - High usage without issues: +0.1 per 100 attempts (max +4)
 * 
 * @param stats - Community interaction statistics
 * @param errorReports - Array of error reports
 * @returns Score from 0 to 20
 */
function calculateCommunityScore(
  stats: CommunityStats, 
  errorReports: Array<{ status: string }>
): number {
  let score = 16 // Base score

  // Count unresolved error reports
  const unresolvedReports = errorReports.filter(r => r.status === 'pending').length

  // Penalty for error reports (-2 each, no floor at 0 for component)
  score -= unresolvedReports * 2

  // Bonus for helpful votes (+0.5 each, max +4)
  const helpfulBonus = Math.min(4, stats.helpfulCount * 0.5)
  score += helpfulBonus

  // Bonus for usage without issues (+0.1 per 100 attempts, max +4)
  // Only count if there are no error reports
  if (unresolvedReports === 0 && stats.practiceCount > 0) {
    const usageBonus = Math.min(4, (stats.practiceCount / 100) * 0.1)
    score += usageBonus
  }

  // Ensure score stays within 0-20 range
  return Math.min(20, Math.max(0, score))
}

/**
 * Determine score tier based on total score
 * 
 * Tiers:
 * - 90-100: 'verified' - Highest quality, expert reviewed
 * - 75-89: 'confident' - Good quality, reviewed or strong community validation
 * - 60-74: 'draft' - Acceptable quality, meets minimum threshold
 * - <60: Not published (handled by database constraint)
 * 
 * @param score - Total Ember Score (0-100)
 * @returns Score tier classification
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return 'verified'
  if (score >= 75) return 'confident'
  return 'draft'
}

/**
 * Get tier display information
 * 
 * @param tier - Score tier
 * @returns Display information for UI
 */
export function getTierInfo(tier: ScoreTier): {
  label: string
  description: string
  color: string
  flames: number
} {
  switch (tier) {
    case 'verified':
      return {
        label: 'Verified',
        description: 'Expert reviewed with strong community validation',
        color: 'blue',
        flames: 3,
      }
    case 'confident':
      return {
        label: 'Confident',
        description: 'Reviewed or well-validated by the community',
        color: 'green',
        flames: 2,
      }
    case 'draft':
      return {
        label: 'Draft',
        description: 'AI-generated, meets quality threshold',
        color: 'gray',
        flames: 1,
      }
  }
}

/**
 * Format score breakdown for display
 * 
 * @param breakdown - Score breakdown components
 * @returns Formatted breakdown for UI
 */
export function formatScoreBreakdown(breakdown: EmberScoreBreakdown): {
  component: string
  score: number
  maxScore: number
  percentage: number
}[] {
  return [
    {
      component: 'Curriculum Alignment',
      score: breakdown.curriculumAlignment,
      maxScore: 40,
      percentage: (breakdown.curriculumAlignment / 40) * 100,
    },
    {
      component: 'Expert Verification',
      score: breakdown.expertVerification,
      maxScore: 40,
      percentage: (breakdown.expertVerification / 40) * 100,
    },
    {
      component: 'Community Feedback',
      score: breakdown.communityFeedback,
      maxScore: 20,
      percentage: (breakdown.communityFeedback / 20) * 100,
    },
  ]
}
