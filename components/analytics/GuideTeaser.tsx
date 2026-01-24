/**
 * Ascent Guide Teaser Component
 * 
 * Displays a locked/teaser version of the Ascent Guide for free tier users.
 * Shows the headline and a truncated narrative hook to encourage upgrade.
 * 
 * @module components/analytics/GuideTeaser
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GatedGuide } from '@/lib/narrative/types';

interface GuideTeaserProps {
  gatedGuide: GatedGuide;
  ctaText?: string;
  className?: string;
}

export function GuideTeaser({ 
  gatedGuide, 
  ctaText = 'Unlock with Ascent Compass',
  className = '' 
}: GuideTeaserProps) {
  const { teaser } = gatedGuide;
  
  if (!teaser) {
    return null;
  }
  
  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 ${className}`}>
      {/* Locked overlay indicator */}
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white/80 px-2 py-1 rounded-full border border-slate-200">
          <Lock className="h-3 w-3" />
          Premium
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-300">
            <Compass className="h-4 w-4 text-slate-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-600">
            Today's Ascent Guide
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visible headline */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 leading-tight">
            "{teaser.headline}"
          </h3>
        </div>
        
        {/* Truncated narrative with blur effect */}
        <div className="relative">
          <p className="text-slate-600 leading-relaxed">
            {teaser.narrativeHook}
          </p>
          
          {/* Blur overlay for locked content */}
          <div className="mt-2 h-16 bg-gradient-to-b from-transparent via-slate-100/80 to-slate-100 flex items-end justify-center relative">
            {/* Fake blurred text lines */}
            <div className="absolute inset-0 flex flex-col gap-2 px-2 pt-2">
              <div className="h-3 bg-slate-300/50 rounded blur-[2px] w-full"></div>
              <div className="h-3 bg-slate-300/50 rounded blur-[2px] w-4/5"></div>
              <div className="h-3 bg-slate-300/50 rounded blur-[2px] w-3/5"></div>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="pt-2">
          <Link href="/pricing">
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Value proposition */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Get daily personalised coaching guidance, conversation starters, and focus recommendations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GuideTeaser;
