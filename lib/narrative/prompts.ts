/**
 * Ascent Guide - LLM Prompt Templates
 * 
 * Prompts for Claude API to generate daily coaching narratives.
 * Includes safety guardrails and growth mindset instructions.
 * 
 * @module lib/narrative/prompts
 */

import type { GuideMetrics } from './types';

/**
 * System prompt with guardrails and guidelines
 */
export const SYSTEM_PROMPT = `You are an empathetic educational coach helping UK parents understand their child's 11+ exam preparation progress.

## Your Role
- Translate learning data into supportive, actionable guidance
- Help parents coach their children effectively
- Build confidence, not anxiety
- Focus on effort and strategy, not innate ability

## CRITICAL GUIDELINES

### Growth Mindset (Carol Dweck)
- PRAISE: Effort, strategy, persistence, improvement
- NEVER PRAISE: Intelligence, being "smart", natural ability
- GOOD: "You worked hard on this" / "Your strategy is improving"
- BAD: "You're so clever" / "You're naturally good at maths"

### The "Yet" Principle
- Frame ALL gaps as temporary
- GOOD: "Haven't mastered geometry yet"
- BAD: "Geometry is a weakness"
- Replace: "weakness" → "area for focus", "failed" → "tricky", "bad" → "developing"

### Behaviour vs Identity
- Critique ACTIONS, never the CHILD
- GOOD: "We noticed rushing in this session"
- BAD: "You are a rusher" / "You're impatient"

### Sandwich Method
Structure: Positive → Constructive → Action
Example: "Great consistency! Accuracy dropped when tired. Try shorter sessions."

## SAFETY GUARDRAILS
1. NEVER suggest medical conditions (ADHD, dyslexia, anxiety) even if data suggests it
2. NEVER compare to other children or "average" scores
3. NEVER use alarmist language ("failing", "behind", "struggling badly")
4. NEVER make predictions about exam outcomes
5. NEVER give parenting advice beyond study habits
6. ALWAYS maintain encouraging, calm, supportive tone

## UK CONTEXT
- This is for 11+ grammar school entrance exams
- Year groups: Year 3-6 (ages 7-11)
- Subjects: Maths, English, Verbal Reasoning, Non-Verbal Reasoning
- Exam format: Typically multiple choice, timed`;

/**
 * Build the user prompt with metrics
 */
export function buildDailyGuidePrompt(metrics: GuideMetrics): string {
  return `Generate a brief daily coaching guide for a parent based on this data:

## Child Data
- Name: ${metrics.childName}
- Year Group: ${metrics.yearGroup}
- Today's Accuracy: ${Math.round(metrics.accuracy)}%
- Questions Attempted: ${metrics.questionsAttempted}
- Rush Factor: ${Math.round(metrics.rushPercent)}% of questions answered in under 5 seconds
- Session Duration: ${Math.round(metrics.sessionDuration)} minutes
- Weakest Topic: ${metrics.weakestTopic} (${Math.round(metrics.weakestTopicAccuracy)}% accuracy from ${metrics.topicAttempts} attempts)
- Streak: ${metrics.streakDays} day${metrics.streakDays !== 1 ? 's' : ''} ${metrics.isStreakActive ? '(active)' : '(ended)'}
${metrics.fatigueDetected ? '- Fatigue Detected: Yes (accuracy dropped toward end of session)' : ''}

## Output Requirements
Return ONLY valid JSON matching this schema:
{
  "headline": "One sentence summary, max 15 words. Start with child's name.",
  "narrative": "2-3 sentences explaining what matters today. Max 60 words. Connect behaviour to outcomes where relevant.",
  "conversationStarter": "A question the parent can ask the child to open a supportive discussion.",
  "focusTopic": "The single most important topic to focus on (or null if none needed)",
  "focusRationale": "Why this topic, in one sentence (or null)"
}

Remember:
- Use "${metrics.childName}" (not "your child" or "they")
- Be specific about numbers when helpful
- Link behaviour (rushing/fatigue) to outcomes when relevant
- End on an actionable note`;
}

/**
 * Parse Claude's response into structured guide
 */
export interface ParsedGuideResponse {
  headline: string;
  narrative: string;
  conversationStarter: string | null;
  focusTopic: string | null;
  focusRationale: string | null;
}

export function parseGuideResponse(response: string): ParsedGuideResponse | null {
  try {
    // Extract JSON from response (Claude sometimes adds preamble)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as ParsedGuideResponse;
    
    // Validate required fields
    if (!parsed.headline || !parsed.narrative) {
      console.error('Missing required fields in response');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse guide response:', error);
    return null;
  }
}

/**
 * Validate generated content against guardrails
 */
export function validateGeneratedContent(content: ParsedGuideResponse): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  const forbiddenTerms = [
    'struggling', 'failing', 'behind', 'poor', 'weak',
    'ADHD', 'dyslexia', 'anxiety', 'disorder',
    'average', 'other children', 'peers',
    'smart', 'clever', 'genius', 'gifted',
    'stupid', 'slow', 'dumb',
  ];
  
  const allText = `${content.headline} ${content.narrative} ${content.conversationStarter || ''}`;
  
  for (const term of forbiddenTerms) {
    if (allText.toLowerCase().includes(term.toLowerCase())) {
      issues.push(`Contains forbidden term: "${term}"`);
    }
  }
  
  // Check for alarmist punctuation
  if (allText.includes('!!') || allText.includes('???')) {
    issues.push('Contains alarmist punctuation');
  }
  
  // Check headline length
  if (content.headline.split(' ').length > 20) {
    issues.push('Headline too long (>20 words)');
  }
  
  // Check narrative length
  if (content.narrative.split(' ').length > 80) {
    issues.push('Narrative too long (>80 words)');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
