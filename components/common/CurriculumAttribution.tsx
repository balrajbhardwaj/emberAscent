/**
 * Curriculum Attribution Footer
 * 
 * Displays required OGL v3.0 attribution for National Curriculum content.
 * Required for legal compliance when using Crown Copyright material.
 * 
 * Place in:
 * - App footer
 * - About/Transparency page
 * - Curriculum browser section
 * 
 * @module components/common/CurriculumAttribution
 */

import { ExternalLink, Crown } from "lucide-react"

interface CurriculumAttributionProps {
  /** Show full attribution or compact version */
  variant?: 'full' | 'compact'
  
  /** Additional CSS classes */
  className?: string
}

/**
 * Full attribution footer with all required legal notices
 */
export function CurriculumAttribution({ 
  variant = 'full',
  className = ''
}: CurriculumAttributionProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        <p className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          National Curriculum content © Crown Copyright.{" "}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground inline-flex items-center gap-0.5"
          >
            OGL v3.0
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </p>
      </div>
    )
  }
  
  return (
    <div className={`text-xs text-muted-foreground space-y-2 ${className}`}>
      <div className="flex items-start gap-2">
        <Crown className="h-4 w-4 mt-0.5 text-amber-600" />
        <div className="space-y-1">
          <p>
            Curriculum content aligned to the{" "}
            <a 
              href="https://www.gov.uk/government/collections/national-curriculum"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground inline-flex items-center gap-1"
            >
              National Curriculum in England
              <ExternalLink className="h-3 w-3" />
            </a>
            {" "}(Department for Education, 2014).
          </p>
          
          <p>
            Contains public sector information licensed under the{" "}
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground inline-flex items-center gap-1"
            >
              Open Government Licence v3.0
              <ExternalLink className="h-3 w-3" />
            </a>.
          </p>
          
          <p className="text-muted-foreground/80">
            11+ preparation content is aligned to GL Assessment and CEM examination styles.
            These are independent exam boards and Ember Ascent is not affiliated with them.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline attribution for question cards
 */
export function InlineCurriculumAttribution() {
  return (
    <span className="text-xs text-muted-foreground">
      © Crown Copyright{" "}
      <a
        href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        OGL v3.0
      </a>
    </span>
  )
}
