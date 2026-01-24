/**
 * Ascent Guide Type Definitions
 * 
 * Types for the daily coaching narrative feature.
 * Used across template engine, generator, and UI components.
 * 
 * @module lib/narrative/types
 */

/**
 * User subscription tier
 */
export type GuideTier = 'free' | 'compass';

/**
 * Metrics input for guide generation
 */
export interface GuideMetrics {
  childId: string;
  childName: string;
  yearGroup: number;
  
  // Performance metrics
  accuracy: number;           // 0-100
  questionsAttempted: number;
  
  // Behavioral metrics
  rushPercent: number;        // % of questions answered <5 seconds
  avgResponseTime: number;    // seconds
  sessionDuration: number;    // minutes
  
  // Topic analysis
  weakestTopic: string;
  weakestTopicAccuracy: number;
  topicAttempts: number;
  
  // Engagement
  streakDays: number;
  isStreakActive: boolean;
  
  // Optional: fatigue indicators
  fatigueDetected?: boolean;
  accuracyDropPercent?: number;
  
  // Context
  date: Date;
  examType?: string;
}

/**
 * Single conversation starter prompt
 */
export interface ConversationStarter {
  trigger: string;            // What triggered this prompt
  question: string;           // The actual question to ask
  context?: string;           // Optional context for the parent
}

/**
 * Focus recommendation with rationale
 */
export interface FocusRecommendation {
  topic: string;
  rationale: string;
  priority: 'urgent' | 'recommended' | 'optional';
  metrics?: {
    accuracy: number;
    attempts: number;
    trend?: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Complete daily guide content
 */
export interface DailyGuide {
  // Core content
  headline: string;           // One-sentence summary (max 15 words)
  narrative: string;          // 2-3 sentences (max 60 words)
  
  // Actionable elements
  conversationStarter: ConversationStarter | null;
  focusRecommendation: FocusRecommendation | null;
  
  // Metadata
  childId: string;
  guideDate: Date;
  generatedAt: Date;
  generationModel?: string;   // e.g., "claude-3-5-sonnet" or "static-template"
  
  // For debugging/auditing
  metricsSnapshot?: GuideMetrics;
}

/**
 * Guide content gated by tier
 * Free tier sees truncated/locked content
 */
export interface GatedGuide {
  guide: DailyGuide;
  tier: GuideTier;
  isLocked: boolean;
  
  // Teaser for free tier
  teaser?: {
    headline: string;         // Full headline shown
    narrativeHook: string;    // Truncated narrative with "..."
  };
}

/**
 * Template definition for static generation
 */
export interface NarrativeTemplate {
  id: string;
  category: 'readiness' | 'rush' | 'fatigue' | 'streak' | 'compound' | 'conversation';
  condition: string;          // Human-readable condition description
  template: string;           // Template with {variable} placeholders
  priority?: number;          // Higher = more important (for selection)
}

/**
 * Template interpolation context
 */
export interface TemplateContext {
  name: string;
  yearGroup: number;
  accuracy: number;
  rushPercent: number;
  weakestTopic: string;
  topicAccuracy: number;
  streakDays: number;
  potentialGain?: number;     // Estimated accuracy improvement
  [key: string]: string | number | boolean | undefined;
}

/**
 * Database row for daily_guides table
 */
export interface DailyGuideRow {
  id: string;
  child_id: string;
  guide_date: string;         // ISO date
  headline: string;
  narrative: string;
  conversation_starter: string | null;
  focus_topic: string | null;
  focus_rationale: string | null;
  metrics_snapshot: GuideMetrics | null;
  generation_model: string | null;
  created_at: string;
}

/**
 * API response for daily guide endpoint
 */
export interface DailyGuideResponse {
  success: boolean;
  guide?: GatedGuide;
  error?: string;
}
