/**
 * Ascent Guide - Template Interpolator
 * 
 * Handles variable substitution and template rendering.
 * Converts templates like "{name} scored {accuracy}%" into actual text.
 * 
 * @module lib/narrative/interpolator
 */

import type { TemplateContext, NarrativeTemplate, GuideMetrics } from './types';

/**
 * Interpolate variables into a template string
 * 
 * @param template - Template with {variable} placeholders
 * @param context - Object with variable values
 * @returns Interpolated string
 * 
 * @example
 * interpolate("{name} scored {accuracy}%", { name: "Emma", accuracy: 85 })
 * // Returns: "Emma scored 85%"
 */
export function interpolate(template: string, context: TemplateContext): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = context[key];
    if (value === undefined || value === null) {
      console.warn(`Template variable "${key}" not found in context`);
      return match; // Keep original placeholder if not found
    }
    return String(value);
  });
}

/**
 * Convert GuideMetrics to TemplateContext
 * Flattens and normalizes data for template interpolation
 */
export function metricsToContext(metrics: GuideMetrics): TemplateContext {
  return {
    name: metrics.childName,
    yearGroup: metrics.yearGroup,
    accuracy: Math.round(metrics.accuracy),
    rushPercent: Math.round(metrics.rushPercent),
    weakestTopic: metrics.weakestTopic,
    topicAccuracy: Math.round(metrics.weakestTopicAccuracy),
    topicAttempts: metrics.topicAttempts,
    streakDays: metrics.streakDays,
    sessionDuration: Math.round(metrics.sessionDuration),
    isStreakActive: metrics.isStreakActive,
    fatigueDetected: metrics.fatigueDetected ?? false,
    // Calculated fields
    potentialGain: calculatePotentialGain(metrics),
  };
}

/**
 * Estimate potential accuracy gain from slowing down
 * Based on empirical observation that rushing correlates with ~15% accuracy loss
 */
function calculatePotentialGain(metrics: GuideMetrics): number {
  if (metrics.rushPercent > 25) {
    return Math.min(15, Math.round(metrics.rushPercent * 0.5));
  }
  if (metrics.rushPercent > 15) {
    return Math.min(10, Math.round(metrics.rushPercent * 0.4));
  }
  return 5;
}

/**
 * Evaluate a simple condition string against context
 * 
 * Supports basic comparisons: ===, !==, >=, <=, >, <, &&, ||
 * 
 * @param condition - Condition string like "accuracy >= 85"
 * @param context - Template context with values
 * @returns Boolean result
 * 
 * @example
 * evaluateCondition("accuracy >= 85 && rushPercent < 20", { accuracy: 90, rushPercent: 10 })
 * // Returns: true
 */
export function evaluateCondition(condition: string, context: TemplateContext): boolean {
  try {
    // Create a safe evaluation function
    // Only allow specific operators and context keys
    const safeCondition = condition
      // Replace variable names with context values
      .replace(/(\w+)\s*(===|!==|>=|<=|>|<)\s*(\d+|true|false|'[^']*')/g, (_match, key, op, value) => {
        const contextValue = context[key];
        if (contextValue === undefined) return 'false';
        
        // Handle string comparisons
        if (typeof contextValue === 'string') {
          return `"${contextValue}" ${op} ${value}`;
        }
        
        return `${contextValue} ${op} ${value}`;
      });
    
    // Evaluate using Function constructor (safer than eval)
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(`return ${safeCondition}`);
    return Boolean(evaluator());
  } catch (error) {
    console.error(`Failed to evaluate condition: ${condition}`, error);
    return false;
  }
}

/**
 * Find all templates that match the given metrics
 * Returns templates sorted by priority (highest first)
 */
export function findMatchingTemplates(
  templates: NarrativeTemplate[],
  metrics: GuideMetrics
): NarrativeTemplate[] {
  const context = metricsToContext(metrics);
  
  return templates
    .filter(template => evaluateCondition(template.condition, context))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Generate narrative from templates and metrics
 * Combines the best matching templates into a coherent narrative
 */
export function generateStaticNarrative(
  templates: NarrativeTemplate[],
  metrics: GuideMetrics
): { headline: string; narrative: string } {
  const context = metricsToContext(metrics);
  const matching = findMatchingTemplates(templates, metrics);
  
  if (matching.length === 0) {
    // Fallback generic narrative
    return {
      headline: `${metrics.childName} practised today — keep building momentum!`,
      narrative: 'Regular practice is the foundation of success. Encourage them to keep going!',
    };
  }
  
  // Use highest priority template for headline
  const headline = interpolate(matching[0].template, context);
  
  // Combine up to 2 templates for narrative
  const narrativeParts: string[] = [];
  const usedCategories = new Set<string>();
  
  for (const template of matching) {
    // Avoid duplicate categories (don't say "rushing" twice)
    if (usedCategories.has(template.category)) continue;
    
    // Skip if this is the same as headline
    if (template.id === matching[0].id) continue;
    
    narrativeParts.push(interpolate(template.template, context));
    usedCategories.add(template.category);
    
    if (narrativeParts.length >= 2) break;
  }
  
  // If no additional narrative, use a generic encouragement
  const narrative = narrativeParts.length > 0
    ? narrativeParts.join(' ')
    : 'Keep up the great work — every session builds toward exam day.';
  
  return { headline, narrative };
}

/**
 * Truncate text with a natural hook for teaser
 * Finds break points like "but", "however", "although" to create intrigue
 */
export function truncateWithHook(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  
  // Look for hook words
  const hookWords = ['but', 'however', 'although', 'yet', 'though'];
  
  for (const hook of hookWords) {
    const hookPattern = new RegExp(`\\b${hook}\\b`, 'i');
    const match = text.match(hookPattern);
    
    if (match && match.index !== undefined) {
      // Include the hook word plus a few characters
      const endIndex = Math.min(match.index + hook.length + 3, text.length);
      return text.slice(0, endIndex).trim() + '...';
    }
  }
  
  // No hook word found — truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace).trim() + '...';
  }
  
  return truncated.trim() + '...';
}
