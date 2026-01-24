/**
 * Ascent Guide - Guide Generator
 * 
 * Generates daily coaching guides using either:
 * - Static templates (fast, free)
 * - Claude LLM (personalized, for Compass tier)
 * 
 * @module lib/narrative/generator
 */

import Anthropic from '@anthropic-ai/sdk';
import type { DailyGuide, GuideMetrics, FocusRecommendation, ConversationStarter } from './types';
import { ALL_TEMPLATES } from './templates';
import { generateStaticNarrative } from './interpolator';
import { selectConversationStarter, generateFocusRecommendation } from './triggers';
import { SYSTEM_PROMPT, buildDailyGuidePrompt, parseGuideResponse, validateGeneratedContent } from './prompts';

// Initialize Anthropic client
const anthropic = new Anthropic();

/**
 * Generate a daily guide using static templates
 * Used for free tier and as fallback
 */
export function generateStaticGuide(metrics: GuideMetrics): DailyGuide {
  const { headline, narrative } = generateStaticNarrative(ALL_TEMPLATES, metrics);
  const conversationStarter = selectConversationStarter(metrics);
  const focusRecommendation = generateFocusRecommendation(metrics);
  
  return {
    headline,
    narrative,
    conversationStarter,
    focusRecommendation,
    childId: metrics.childId,
    guideDate: metrics.date,
    generatedAt: new Date(),
    generationModel: 'static-template',
    metricsSnapshot: metrics,
  };
}

/**
 * Generate a daily guide using Claude LLM
 * Used for Compass tier subscribers
 */
export async function generateLLMGuide(metrics: GuideMetrics): Promise<DailyGuide> {
  try {
    const prompt = buildDailyGuidePrompt(metrics);
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');
    
    const parsed = parseGuideResponse(responseText);
    
    if (!parsed) {
      console.error('Failed to parse LLM response, falling back to static');
      return generateStaticGuide(metrics);
    }
    
    // Validate content against guardrails
    const validation = validateGeneratedContent(parsed);
    if (!validation.valid) {
      console.warn('LLM content failed validation:', validation.issues);
      // Could regenerate or fall back to static
      return generateStaticGuide(metrics);
    }
    
    // Convert parsed response to DailyGuide
    const conversationStarter: ConversationStarter | null = parsed.conversationStarter
      ? {
          trigger: 'llm_generated',
          question: parsed.conversationStarter,
        }
      : null;
    
    const focusRecommendation: FocusRecommendation | null = parsed.focusTopic
      ? {
          topic: parsed.focusTopic,
          rationale: parsed.focusRationale || '',
          priority: metrics.weakestTopicAccuracy < 50 ? 'urgent' : 'recommended',
          metrics: {
            accuracy: metrics.weakestTopicAccuracy,
            attempts: metrics.topicAttempts,
          },
        }
      : null;
    
    return {
      headline: parsed.headline,
      narrative: parsed.narrative,
      conversationStarter,
      focusRecommendation,
      childId: metrics.childId,
      guideDate: metrics.date,
      generatedAt: new Date(),
      generationModel: 'claude-sonnet-4-20250514',
      metricsSnapshot: metrics,
    };
  } catch (error) {
    console.error('LLM generation failed, falling back to static:', error);
    return generateStaticGuide(metrics);
  }
}

/**
 * Generate a daily guide with appropriate method based on tier
 */
export async function generateDailyGuide(
  metrics: GuideMetrics,
  useLLM: boolean = false
): Promise<DailyGuide> {
  if (useLLM) {
    return generateLLMGuide(metrics);
  }
  return generateStaticGuide(metrics);
}

/**
 * Generate guides for multiple children (batch processing)
 * Used for EOD batch job
 */
export async function generateGuidesInBatch(
  metricsArray: GuideMetrics[],
  useLLM: boolean = true,
  batchSize: number = 10
): Promise<DailyGuide[]> {
  const guides: DailyGuide[] = [];
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < metricsArray.length; i += batchSize) {
    const batch = metricsArray.slice(i, i + batchSize);
    
    const batchPromises = batch.map(metrics => 
      generateDailyGuide(metrics, useLLM).catch(error => {
        console.error(`Failed to generate guide for child ${metrics.childId}:`, error);
        return generateStaticGuide(metrics); // Fallback
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    guides.push(...batchResults);
    
    // Rate limiting: wait between batches
    if (i + batchSize < metricsArray.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return guides;
}
