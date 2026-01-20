/**
 * Admin Reports Page
 * 
 * Administrative interface for reviewing and managing error reports.
 * Future implementation - placeholder for now.
 * 
 * @module app/(dashboard)/admin/reports
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react"

/**
 * Check if user is admin
 */
async function checkAdminAccess() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }
  
  // TODO: Add proper admin role checking
  // For now, redirect all users since this is not implemented
  redirect("/progress")
}

/**
 * Admin Reports Page
 * 
 * Lists all error reports for admin review.
 * Future implementation.
 */
export default async function AdminReportsPage() {
  await checkAdminAccess()
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Question Reports
        </h1>
        <p className="text-slate-600">
          Review and manage user-reported question issues
        </p>
      </div>
      
      {/* Coming Soon Notice */}
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Admin Interface Coming Soon
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              The administrative interface for managing error reports is under development.
              Reports are being collected in the database for future review.
            </p>
            <div className="text-xs text-slate-500">
              Features in development:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>View all pending reports</li>
                <li>Question preview and editing links</li>
                <li>Mark reports as reviewed/fixed/dismissed</li>
                <li>Admin notes and resolution tracking</li>
                <li>Report analytics and trends</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Mock Report Cards (for design reference) */}
      <div className="mt-8 space-y-4 opacity-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Preview: Report Management Interface
        </h3>
        
        {/* Sample Report Cards */}
        {[
          {
            id: "1",
            type: "incorrect_answer",
            status: "pending",
            question: "What is 2 + 2?",
            description: "The answer should be 4, not 5.",
            reportedAt: "2 hours ago",
            reportedBy: "user@example.com",
          },
          {
            id: "2",
            type: "unclear",
            status: "reviewed",
            question: "Which word fits best in the sentence?",
            description: "The question is too ambiguous.",
            reportedAt: "1 day ago",
            reportedBy: "parent@example.com",
          },
        ].map((report) => (
          <Card key={report.id} className="p-4 border-dashed">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={
                      report.type === "incorrect_answer"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {report.type === "incorrect_answer" ? "Wrong Answer" : "Unclear"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      report.status === "pending"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {report.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                    {report.status === "reviewed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {report.status}
                  </Badge>
                  <span className="text-xs text-slate-500">{report.reportedAt}</span>
                </div>
                <p className="text-sm text-slate-800 mb-2 line-clamp-2">
                  <strong>Question:</strong> {report.question}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Issue:</strong> {report.description}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Reported by: {report.reportedBy}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
