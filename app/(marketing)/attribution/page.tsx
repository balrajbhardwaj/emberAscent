/**
 * Attribution Page
 * 
 * Full attribution and licensing information.
 * OGL v3.0 compliance documentation.
 * 
 * @module app/(marketing)/attribution
 */

import { Metadata } from "next"
import Link from "next/link"
import { Scale, ExternalLink, FileText, BookOpen, Bot, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketingNav } from "@/components/common/MarketingNav"

export const metadata: Metadata = {
  title: "Content Attribution | Ember Ascent",
  description: "Full attribution and licensing information for Ember Ascent content, including UK National Curriculum materials and AI-generated questions.",
}

export default function AttributionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingNav />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Content Attribution</h1>
        <p className="text-lg text-muted-foreground">
          Complete transparency about our content sources, licenses, and creation process.
        </p>
      </div>

      <div className="space-y-8">
        {/* Crown Copyright */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Crown Copyright Materials
                </CardTitle>
                <CardDescription>
                  UK National Curriculum alignment and objectives
                </CardDescription>
              </div>
              <Badge variant="secondary">OGL v3.0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our questions are aligned with the UK National Curriculum objectives and assessment 
              criteria. These curriculum materials are:
            </p>
            
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>© Crown Copyright</li>
              <li>
                Licensed under the{" "}
                <Link 
                  href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  Open Government License v3.0
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>Published by the Department for Education</li>
              <li>Available at{" "}
                <Link 
                  href="https://www.gov.uk/government/collections/national-curriculum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  gov.uk
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Attribution Statement:</p>
              <p className="text-muted-foreground italic">
                "Contains public sector information licensed under the Open Government License v3.0. 
                Curriculum objectives and assessment criteria © Crown Copyright."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI-Generated Questions
                </CardTitle>
                <CardDescription>
                  Created using Claude AI by Anthropic
                </CardDescription>
              </div>
              <Badge variant="secondary">Original Content</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The majority of our practice questions are generated using artificial intelligence:
            </p>
            
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>Generated using Claude 3.5 Sonnet (Anthropic)</li>
              <li>Aligned with UK National Curriculum objectives</li>
              <li>Reviewed by UK-qualified education experts</li>
              <li>Quality-scored using our Ember Score system (0-100)</li>
              <li>Licensed under Open Government License v3.0</li>
            </ul>

            <p className="text-sm text-muted-foreground">
              While the questions themselves are original content created by AI, they reference and 
              align with Crown Copyright curriculum materials.
            </p>
          </CardContent>
        </Card>

        {/* Expert-Created Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Expert-Created Content
                </CardTitle>
                <CardDescription>
                  Created by qualified UK educators
                </CardDescription>
              </div>
              <Badge variant="secondary">Original Content</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Some content is created or significantly modified by our team of UK-qualified teachers:
            </p>
            
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>Question reviews and modifications</li>
              <li>Explanations and worked examples</li>
              <li>Topic guidance and study materials</li>
              <li>Assessment frameworks</li>
            </ul>

            <p className="text-sm text-muted-foreground">
              All expert-created content is also licensed under OGL v3.0 to maintain consistency 
              and openness.
            </p>
          </CardContent>
        </Card>

        {/* Platform Software */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Platform Software
                </CardTitle>
                <CardDescription>
                  Ember Ascent application and codebase
                </CardDescription>
              </div>
              <Badge variant="secondary">Proprietary</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Ember Ascent platform software (website, applications, infrastructure) is:
            </p>
            
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>© Ember Ascent {new Date().getFullYear()}</li>
              <li>Proprietary software, all rights reserved</li>
              <li>Not covered by the Open Government License</li>
              <li>Subject to our Terms of Service</li>
            </ul>

            <p className="text-sm text-muted-foreground">
              Only the educational content (questions, curriculum alignments) falls under OGL v3.0. 
              The platform itself remains proprietary.
            </p>
          </CardContent>
        </Card>

        {/* How We Use OGL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              How We Comply with OGL v3.0
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Open Government License v3.0 requires us to:
            </p>
            
            <div className="space-y-3">
              <div className="rounded-lg border-l-4 border-l-green-500 bg-muted p-3">
                <p className="text-sm font-semibold mb-1">✓ Acknowledge the source</p>
                <p className="text-xs text-muted-foreground">
                  We clearly state that curriculum materials are Crown Copyright
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-l-green-500 bg-muted p-3">
                <p className="text-sm font-semibold mb-1">✓ Provide a link to the license</p>
                <p className="text-xs text-muted-foreground">
                  Links to OGL v3.0 appear on every page footer and this attribution page
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-l-green-500 bg-muted p-3">
                <p className="text-sm font-semibold mb-1">✓ State that Information Provider endorsement is not implied</p>
                <p className="text-xs text-muted-foreground">
                  The Department for Education does not endorse or recommend Ember Ascent
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-l-green-500 bg-muted p-3">
                <p className="text-sm font-semibold mb-1">✓ Ensure we don't mislead others or misrepresent the Information</p>
                <p className="text-xs text-muted-foreground">
                  All curriculum references are accurate and our Ember Score system provides transparency 
                  about content quality
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions or Concerns */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you have questions about our content attribution, licensing, or transparency practices:
            </p>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>View our Transparency Report:</strong>{" "}
                <Link href="/transparency" className="text-primary underline">
                  Full transparency documentation
                </Link>
              </div>
              
              <div>
                <strong>Contact us:</strong>{" "}
                <a href="mailto:legal@emberascent.com" className="text-primary underline">
                  legal@emberascent.com
                </a>
              </div>

              <div>
                <strong>Report an issue:</strong>{" "}
                <Link href="/contact" className="text-primary underline">
                  Contact form
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
