/**
 * Ascent Guide Component
 * 
 * Displays the daily coaching narrative for Compass tier subscribers.
 * Shows headline, narrative, focus recommendation, and conversation starter.
 * 
 * @module components/analytics/AscentGuide
 */

'use client';

import React from 'react';
import { Compass, MessageCircle, Target, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DailyGuide } from '@/lib/narrative/types';

interface AscentGuideProps {
  guide: DailyGuide;
  className?: string;
}

/**
 * Format date for display
 */
function formatGuideDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Get priority color for focus recommendation
 */
function getPriorityColor(priority: 'urgent' | 'recommended' | 'optional'): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'recommended':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'optional':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function AscentGuide({ guide, className = '' }: AscentGuideProps) {
  return (
    <Card className={`bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Today's Ascent Guide
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            {formatGuideDate(new Date(guide.guideDate))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Headline */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 leading-tight">
            "{guide.headline}"
          </h3>
        </div>
        
        {/* Narrative */}
        <p className="text-slate-700 leading-relaxed">
          {guide.narrative}
        </p>
        
        {/* Focus Recommendation */}
        {guide.focusRecommendation && (
          <div className="bg-white/70 rounded-lg p-4 border border-orange-100">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">
                    Recommended Focus
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(guide.focusRecommendation.priority)}`}
                  >
                    {guide.focusRecommendation.priority}
                  </Badge>
                </div>
                <p className="font-medium text-orange-700 mb-1">
                  {guide.focusRecommendation.topic}
                </p>
                {guide.focusRecommendation.rationale && (
                  <p className="text-sm text-slate-600">
                    {guide.focusRecommendation.rationale}
                  </p>
                )}
                {guide.focusRecommendation.metrics && (
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{guide.focusRecommendation.metrics.accuracy}% accuracy</span>
                    <span>{guide.focusRecommendation.metrics.attempts} attempts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Conversation Starter */}
        {guide.conversationStarter && (
          <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <MessageCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">
                  Conversation Starter
                </p>
                <p className="text-slate-700 italic">
                  "{guide.conversationStarter.question}"
                </p>
                {guide.conversationStarter.context && (
                  <p className="text-xs text-slate-500 mt-2">
                    {guide.conversationStarter.context}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Generation badge */}
        <div className="flex justify-end">
          <Badge variant="outline" className="text-xs text-slate-400 bg-white/50">
            <Sparkles className="h-3 w-3 mr-1" />
            {guide.generationModel === 'static-template' ? 'Template' : 'AI-assisted'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default AscentGuide;
