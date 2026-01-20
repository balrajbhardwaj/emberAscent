/**
 * Attribution Footer Component
 * 
 * OGL v3.0 compliance footer for all pages.
 * Displays Crown Copyright notice and license information.
 * 
 * @module components/common/AttributionFooter
 */

import Link from "next/link"
import { Scale, BookOpen, Shield } from "lucide-react"

/**
 * AttributionFooter - Legal compliance footer
 * 
 * Required by Open Government License v3.0 for UK National Curriculum content.
 * Displays:
 * - Crown Copyright notice
 * - License information
 * - Links to attribution and transparency pages
 */
export function AttributionFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Attribution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Scale className="h-4 w-4" />
              <span>Content Attribution</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions aligned with UK National Curriculum objectives. Curriculum content 
              © Crown Copyright, licensed under{" "}
              <Link 
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Open Government License v3.0
              </Link>
              .
            </p>
          </div>

          {/* AI Generation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4" />
              <span>Content Generation</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions generated using Claude AI (Anthropic) and reviewed by UK-qualified 
              education experts. All content aligned with National Curriculum standards.
            </p>
          </div>

          {/* Transparency */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4" />
              <span>Transparency</span>
            </div>
            <p className="text-xs text-muted-foreground">
              We believe in complete transparency about content quality and sources.
            </p>
            <div className="flex gap-3 text-xs">
              <Link 
                href="/attribution" 
                className="underline hover:text-foreground"
              >
                Full Attribution
              </Link>
              <Link 
                href="/transparency" 
                className="underline hover:text-foreground"
              >
                Transparency Report
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>
            Ember Ascent © {new Date().getFullYear()}. 
            Platform content and software licensed separately from curriculum materials.
          </p>
          <p className="mt-1">
            Contains public sector information licensed under the Open Government License v3.0.
          </p>
        </div>
      </div>
    </footer>
  )
}
