/**
 * Ember Score Calculation Service Tests
 * 
 * @module lib/scoring/__tests__/emberScore.test
 */

import { describe, it, expect } from 'vitest'
import {
  calculateEmberScore,
  getScoreTier,
  getTierInfo,
  formatScoreBreakdown,
} from '../emberScore'
import type { QuestionForScoring } from '@/types/scoring'

describe('calculateEmberScore', () => {
  it('should calculate maximum score for fully reviewed question with NC reference', () => {
    const question: QuestionForScoring = {
      id: 'q1',
      curriculumReference: 'KS2 English Y5 Vocabulary',
      reviewStatus: 'reviewed',
      totalAttempts: 1000,
      errorReportCount: 0,
      helpfulVotes: 10,
    }

    const result = calculateEmberScore(question)

    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.breakdown.curriculumAlignment).toBe(40)
    expect(result.breakdown.expertVerification).toBe(40)
    expect(result.breakdown.communityFeedback).toBeGreaterThan(16)
    expect(result.tier).toBe('verified')
  })

  it('should calculate minimum publishable score for AI-only question', () => {
    const question: QuestionForScoring = {
      id: 'q2',
      curriculumReference: null,
      reviewStatus: 'ai_only',
      totalAttempts: 0,
      errorReportCount: 0,
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)

    // AI-only (10) + No curriculum (0) + Base community (16) = 26
    expect(result.score).toBe(26)
    expect(result.breakdown.curriculumAlignment).toBe(0)
    expect(result.breakdown.expertVerification).toBe(10)
    expect(result.breakdown.communityFeedback).toBe(16)
    expect(result.tier).toBe('draft')
  })

  it('should handle spot-checked questions', () => {
    const question: QuestionForScoring = {
      id: 'q3',
      curriculumReference: 'Y6 Maths Number',
      reviewStatus: 'spot_checked',
      totalAttempts: 500,
      errorReportCount: 0,
      helpfulVotes: 5,
    }

    const result = calculateEmberScore(question)

    // Curriculum (40) + Spot-checked (25) + Community (~18.5) = ~83.5
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.breakdown.expertVerification).toBe(25)
    expect(result.tier).toBe('confident')
  })

  it('should penalize questions with error reports', () => {
    const question: QuestionForScoring = {
      id: 'q4',
      curriculumReference: 'KS2 English Y5',
      reviewStatus: 'reviewed',
      totalAttempts: 100,
      errorReportCount: 3,
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)

    // Curriculum (40) + Reviewed (40) + Community (16 - 6) = 90
    expect(result.breakdown.communityFeedback).toBe(10) // 16 - (3 * 2)
    expect(result.score).toBe(90)
  })

  it('should not let community score go below 0', () => {
    const question: QuestionForScoring = {
      id: 'q5',
      curriculumReference: 'KS2 Maths',
      reviewStatus: 'reviewed',
      totalAttempts: 50,
      errorReportCount: 20, // Way too many reports
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)

    expect(result.breakdown.communityFeedback).toBe(0) // Floored at 0
    expect(result.score).toBe(80) // 40 + 40 + 0
  })

  it('should cap total score at 100', () => {
    const question: QuestionForScoring = {
      id: 'q6',
      curriculumReference: 'KS2 English Y6',
      reviewStatus: 'reviewed',
      totalAttempts: 5000, // Very high usage
      errorReportCount: 0,
      helpfulVotes: 20, // Lots of helpful votes
    }

    const result = calculateEmberScore(question)

    // Even with bonuses, should not exceed 100
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe('curriculum score calculation', () => {
  it('should give full points for valid KS2 reference', () => {
    const question: QuestionForScoring = {
      id: 'q7',
      curriculumReference: 'KS2 English Y5 Vocabulary',
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.curriculumAlignment).toBe(40)
  })

  it('should give full points for Year group format', () => {
    const question: QuestionForScoring = {
      id: 'q8',
      curriculumReference: 'Y6 Maths Number and Place Value',
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.curriculumAlignment).toBe(40)
  })

  it('should give partial points for non-standard reference', () => {
    const question: QuestionForScoring = {
      id: 'q9',
      curriculumReference: 'Some vague reference',
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.curriculumAlignment).toBe(20)
  })

  it('should give zero points for empty reference', () => {
    const question: QuestionForScoring = {
      id: 'q10',
      curriculumReference: '',
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.curriculumAlignment).toBe(0)
  })

  it('should give zero points for null reference', () => {
    const question: QuestionForScoring = {
      id: 'q11',
      curriculumReference: null,
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.curriculumAlignment).toBe(0)
  })
})

describe('expert verification score', () => {
  it('should give 40 points for reviewed status', () => {
    const question: QuestionForScoring = {
      id: 'q12',
      reviewStatus: 'reviewed',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.expertVerification).toBe(40)
  })

  it('should give 25 points for spot_checked status', () => {
    const question: QuestionForScoring = {
      id: 'q13',
      reviewStatus: 'spot_checked',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.expertVerification).toBe(25)
  })

  it('should give 10 points for ai_only status', () => {
    const question: QuestionForScoring = {
      id: 'q14',
      reviewStatus: 'ai_only',
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.expertVerification).toBe(10)
  })

  it('should default to 10 points for null status', () => {
    const question: QuestionForScoring = {
      id: 'q15',
      reviewStatus: null,
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.expertVerification).toBe(10)
  })
})

describe('community feedback score', () => {
  it('should start with base score of 16', () => {
    const question: QuestionForScoring = {
      id: 'q16',
      totalAttempts: 0,
      errorReportCount: 0,
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.communityFeedback).toBe(16)
  })

  it('should add bonus for helpful votes', () => {
    const question: QuestionForScoring = {
      id: 'q17',
      totalAttempts: 100,
      errorReportCount: 0,
      helpfulVotes: 4, // +2 bonus (0.5 each)
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.communityFeedback).toBeGreaterThan(16)
  })

  it('should cap helpful vote bonus at 4 points', () => {
    const question: QuestionForScoring = {
      id: 'q18',
      totalAttempts: 100,
      errorReportCount: 0,
      helpfulVotes: 20, // Should only add max 4 points
    }

    const result = calculateEmberScore(question)
    // 16 base + 4 helpful + 0.1 usage = 20.1, but capped at 20
    expect(result.breakdown.communityFeedback).toBe(20)
  })

  it('should add usage bonus when no errors', () => {
    const question: QuestionForScoring = {
      id: 'q19',
      totalAttempts: 1000, // +1 bonus (0.1 per 100)
      errorReportCount: 0,
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)
    expect(result.breakdown.communityFeedback).toBeGreaterThan(16)
  })

  it('should not add usage bonus when there are errors', () => {
    const question: QuestionForScoring = {
      id: 'q20',
      totalAttempts: 1000,
      errorReportCount: 1, // Even 1 error prevents usage bonus
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)
    // 16 base - 2 error penalty = 14
    expect(result.breakdown.communityFeedback).toBe(14)
  })

  it('should cap usage bonus at 4 points', () => {
    const question: QuestionForScoring = {
      id: 'q21',
      totalAttempts: 50000, // Way more than needed for max bonus
      errorReportCount: 0,
      helpfulVotes: 0,
    }

    const result = calculateEmberScore(question)
    // 16 base + 4 max usage = 20
    expect(result.breakdown.communityFeedback).toBe(20)
  })
})

describe('getScoreTier', () => {
  it('should return "verified" for scores 90-100', () => {
    expect(getScoreTier(90)).toBe('verified')
    expect(getScoreTier(95)).toBe('verified')
    expect(getScoreTier(100)).toBe('verified')
  })

  it('should return "confident" for scores 75-89', () => {
    expect(getScoreTier(75)).toBe('confident')
    expect(getScoreTier(80)).toBe('confident')
    expect(getScoreTier(89)).toBe('confident')
  })

  it('should return "draft" for scores 60-74', () => {
    expect(getScoreTier(60)).toBe('draft')
    expect(getScoreTier(65)).toBe('draft')
    expect(getScoreTier(74)).toBe('draft')
  })

  it('should return "draft" for scores below 60', () => {
    expect(getScoreTier(50)).toBe('draft')
    expect(getScoreTier(30)).toBe('draft')
    expect(getScoreTier(0)).toBe('draft')
  })
})

describe('getTierInfo', () => {
  it('should return correct info for verified tier', () => {
    const info = getTierInfo('verified')
    expect(info.label).toBe('Verified')
    expect(info.color).toBe('green')
    expect(info.flames).toBe(3)
    expect(info.description).toBeTruthy()
  })

  it('should return correct info for confident tier', () => {
    const info = getTierInfo('confident')
    expect(info.label).toBe('Confident')
    expect(info.color).toBe('amber')
    expect(info.flames).toBe(2)
    expect(info.description).toBeTruthy()
  })

  it('should return correct info for draft tier', () => {
    const info = getTierInfo('draft')
    expect(info.label).toBe('Draft')
    expect(info.color).toBe('gray')
    expect(info.flames).toBe(1)
    expect(info.description).toBeTruthy()
  })
})

describe('formatScoreBreakdown', () => {
  it('should format breakdown with percentages', () => {
    const breakdown = {
      curriculumAlignment: 40,
      expertVerification: 40,
      communityFeedback: 20,
    }

    const formatted = formatScoreBreakdown(breakdown)

    expect(formatted).toHaveLength(3)
    expect(formatted[0].component).toBe('Curriculum Alignment')
    expect(formatted[0].score).toBe(40)
    expect(formatted[0].maxScore).toBe(40)
    expect(formatted[0].percentage).toBe(100)
  })

  it('should calculate percentages correctly', () => {
    const breakdown = {
      curriculumAlignment: 20, // 50% of 40
      expertVerification: 25, // 62.5% of 40
      communityFeedback: 10, // 50% of 20
    }

    const formatted = formatScoreBreakdown(breakdown)

    expect(formatted[0].percentage).toBe(50)
    expect(formatted[1].percentage).toBe(62.5)
    expect(formatted[2].percentage).toBe(50)
  })
})

describe('edge cases', () => {
  it('should handle undefined optional fields', () => {
    const question: QuestionForScoring = {
      id: 'q22',
    }

    const result = calculateEmberScore(question)

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.tier).toBeDefined()
  })

  it('should handle negative error report count (data integrity)', () => {
    const question: QuestionForScoring = {
      id: 'q23',
      errorReportCount: -5, // Should not happen, but handle gracefully
    }

    const result = calculateEmberScore(question)

    // Negative errors would add to score, should cap at 20
    expect(result.breakdown.communityFeedback).toBe(20)
  })

  it('should return Date object for lastCalculated', () => {
    const question: QuestionForScoring = {
      id: 'q24',
    }

    const result = calculateEmberScore(question)

    expect(result.lastCalculated).toBeInstanceOf(Date)
  })
})
