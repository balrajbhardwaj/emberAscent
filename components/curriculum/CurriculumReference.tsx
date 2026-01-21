/**
 * Curriculum Reference Component
 * 
 * Displays curriculum alignment information on question cards.
 * Shows NC objectives for Maths/English, or exam type for 11+ VR/NVR.
 * 
 * Features:
 * - Compact badge view for inline display
 * - Expanded popover with full objective text
 * - Source attribution for transparency
 * 
 * @module components/curriculum/CurriculumReference
 */
"use client"

import { BookOpen, GraduationCap, Info, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CurriculumObjective, QuestionTypeTaxonomy } from "@/types/curriculum"

interface CurriculumReferenceProps {
  /** Curriculum objectives for Maths/English questions */
  objectives?: CurriculumObjective[]
  
  /** Question types for 11+ VR/NVR questions */
  questionTypes?: QuestionTypeTaxonomy[]
  
  /** Simple curriculum code string (fallback if no full objective data) */
  curriculumCode?: string
  
  /** Compact badge display or full inline display */
  compact?: boolean
  
  /** Show source document attribution */
  showSource?: boolean
}

/**
 * Displays curriculum alignment information on question cards
 */
export function CurriculumReference({
  objectives = [],
  questionTypes = [],
  curriculumCode,
  compact = false,
  showSource = false,
}: CurriculumReferenceProps) {
  const hasObjectives = objectives.length > 0
  const hasTypes = questionTypes.length > 0
  const hasCode = !!curriculumCode
  
  // If no data at all, don't render
  if (!hasObjectives && !hasTypes && !hasCode) {
    return null
  }
  
  // Simple code-only display (fallback)
  if (!hasObjectives && !hasTypes && hasCode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 text-xs cursor-help bg-blue-50 text-blue-700 border-blue-200">
              <BookOpen className="h-3 w-3" />
              {curriculumCode}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">National Curriculum Reference</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  // Curriculum-aligned content (Maths/English)
  if (hasObjectives) {
    const primary = objectives.find(o => o) // Get first/primary objective
    if (!primary) return null
    
    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs cursor-help bg-emerald-50 text-emerald-700 border-emerald-200">
                <BookOpen className="h-3 w-3" />
                NC {primary.code}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">{primary.strand}</p>
              {primary.sub_strand && (
                <p className="text-xs text-muted-foreground">{primary.sub_strand}</p>
              )}
              <p className="text-sm mt-1 line-clamp-3">{primary.objective_text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span className="group-hover:underline">NC {primary.code}</span>
            <Info className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Year {primary.year_group} • {primary.subject}
                </Badge>
                {primary.statutory && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Statutory
                  </Badge>
                )}
              </div>
              <h4 className="font-medium mt-2">{primary.strand}</h4>
              {primary.sub_strand && (
                <p className="text-sm text-muted-foreground">{primary.sub_strand}</p>
              )}
            </div>
            
            {/* Objective Text */}
            <div className="border-t pt-3">
              <p className="text-sm leading-relaxed">{primary.objective_text}</p>
            </div>
            
            {/* DfE Code */}
            {primary.dfe_code && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  DfE: {primary.dfe_code}
                </span>
              </div>
            )}
            
            {/* Source Attribution */}
            {showSource && primary.source_document && (
              <div className="border-t pt-2 text-xs text-muted-foreground">
                <p>Source: {primary.source_document}</p>
                {primary.source_page && <p>Page {primary.source_page}</p>}
              </div>
            )}
            
            {/* Additional Objectives */}
            {objectives.length > 1 && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Also covers:
                </p>
                <div className="flex flex-wrap gap-1">
                  {objectives.slice(1).map((obj) => (
                    <Badge key={obj.id} variant="outline" className="text-xs">
                      {obj.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* OGL Attribution */}
            <div className="border-t pt-2 text-xs text-muted-foreground opacity-75">
              <p>
                © Crown Copyright. Licensed under{" "}
                <a 
                  href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  OGL v3.0
                </a>
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
  
  // 11+ VR/NVR content
  if (hasTypes) {
    const primary = questionTypes[0]
    
    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs cursor-help bg-purple-50 text-purple-700 border-purple-200">
                <GraduationCap className="h-3 w-3" />
                {primary.exam_board} • {primary.type_name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{primary.type_name}</p>
              {primary.type_description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {primary.type_description}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
            <span className="group-hover:underline">
              {primary.exam_board} • {primary.type_name}
            </span>
            <Info className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  {primary.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {primary.exam_board}
                </Badge>
              </div>
              <h4 className="font-medium mt-2">{primary.type_name}</h4>
            </div>
            
            {/* Description */}
            {primary.type_description && (
              <p className="text-sm text-muted-foreground">
                {primary.type_description}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 text-xs">
              {primary.typical_age_range && (
                <Badge variant="outline">Ages {primary.typical_age_range}</Badge>
              )}
              {primary.difficulty_range && (
                <Badge variant="outline">{primary.difficulty_range}</Badge>
              )}
            </div>
            
            {/* Keywords */}
            {primary.keywords && primary.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {primary.keywords.slice(0, 5).map((keyword) => (
                  <span 
                    key={keyword}
                    className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            {/* Note about 11+ */}
            <div className="border-t pt-2 text-xs text-muted-foreground opacity-75">
              <p>
                11+ question type aligned to {primary.exam_board} examination style.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
  
  return null
}

/**
 * Simple inline curriculum badge for question lists
 */
export function CurriculumBadge({ code, showTooltip = false }: { code: string; showTooltip?: boolean }) {
  const isVR = code.startsWith('VR-')
  const isNVR = code.startsWith('NVR-')
  const is11Plus = isVR || isNVR
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`text-xs gap-1 ${
        is11Plus 
          ? 'bg-purple-50 text-purple-700 border-purple-200' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {is11Plus ? (
        <GraduationCap className="h-3 w-3" />
      ) : (
        <BookOpen className="h-3 w-3" />
      )}
      {code}
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
    </Badge>
  )
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">
              {badge}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {is11Plus ? '11+ Exam Style' : 'UK National Curriculum Reference'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return badge
}
