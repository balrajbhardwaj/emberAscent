/**
 * Unit Test: Ember Score Calculation
 * 
 * Tests the core Ember Score algorithm
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateEmberScore, 
  updateEmberScore,
  getScoreColor,
  type EmberScoreFactors 
} from '@/lib/scoring/ember-score';

describe('calculateEmberScore', () => {
  it('calculates score for perfect performance', () => {
    const factors: EmberScoreFactors = {
      accuracy: 1.0,
      speed: 1.0,
      consistency: 1.0,
      difficulty: 'challenge',
      streak: 10,
    };

    const score = calculateEmberScore(factors);
    
    expect(score).toBe(100);
  });

  it('calculates score for average performance', () => {
    const factors: EmberScoreFactors = {
      accuracy: 0.6,
      speed: 0.7,
      consistency: 0.6,
      difficulty: 'standard',
      streak: 3,
    };

    const score = calculateEmberScore(factors);
    
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThanOrEqual(80);
  });

  it('applies difficulty multiplier correctly', () => {
    const baseFactors: EmberScoreFactors = {
      accuracy: 0.8,
      speed: 0.8,
      consistency: 0.8,
      difficulty: 'foundation',
      streak: 5,
    };

    const foundationScore = calculateEmberScore(baseFactors);
    
    const challengeScore = calculateEmberScore({
      ...baseFactors,
      difficulty: 'challenge',
    });

    expect(challengeScore).toBeGreaterThan(foundationScore);
  });

  it('enforces minimum score of 60', () => {
    const factors: EmberScoreFactors = {
      accuracy: 0.1,
      speed: 0.1,
      consistency: 0.1,
      difficulty: 'foundation',
      streak: 0,
    };

    const score = calculateEmberScore(factors);
    
    expect(score).toBe(60);
  });

  it('enforces maximum score of 100', () => {
    const factors: EmberScoreFactors = {
      accuracy: 2.0, // Invalid but test enforcement
      speed: 2.0,
      consistency: 2.0,
      difficulty: 'challenge',
      streak: 100,
    };

    const score = calculateEmberScore(factors);
    
    expect(score).toBe(100);
  });
});

describe('updateEmberScore', () => {
  it('increases score after correct answer', () => {
    const currentScore = 75;
    const newScore = updateEmberScore(currentScore, {
      correct: true,
      difficulty: 'standard',
      timeRating: 'fast',
    });

    expect(newScore).toBeGreaterThan(currentScore);
  });

  it('decreases score after incorrect answer', () => {
    const currentScore = 75;
    const newScore = updateEmberScore(currentScore, {
      correct: false,
      difficulty: 'standard',
      timeRating: 'slow',
    });

    expect(newScore).toBeLessThan(currentScore);
  });

  it('limits change to maximum delta per question', () => {
    const currentScore = 70;
    
    // Perfect answer on challenge question
    const newScore = updateEmberScore(currentScore, {
      correct: true,
      difficulty: 'challenge',
      timeRating: 'fast',
    });

    const delta = newScore - currentScore;
    
    // Should not increase more than 5 points per question
    expect(delta).toBeLessThanOrEqual(5);
  });
});

describe('getScoreColor', () => {
  it('returns green for high scores', () => {
    expect(getScoreColor(90)).toBe('green');
    expect(getScoreColor(85)).toBe('green');
    expect(getScoreColor(80)).toBe('green');
  });

  it('returns yellow for medium scores', () => {
    expect(getScoreColor(79)).toBe('yellow');
    expect(getScoreColor(75)).toBe('yellow');
    expect(getScoreColor(70)).toBe('yellow');
  });

  it('returns orange for low scores', () => {
    expect(getScoreColor(69)).toBe('orange');
    expect(getScoreColor(65)).toBe('orange');
    expect(getScoreColor(60)).toBe('orange');
  });

  it('handles edge cases', () => {
    expect(getScoreColor(100)).toBe('green');
    expect(getScoreColor(60)).toBe('orange');
  });
});
