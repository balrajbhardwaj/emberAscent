/**
 * Reports API Route
 * 
 * Handles creation of error reports for questions.
 * Includes authentication, validation, and rate limiting.
 * 
 * @module app/api/reports
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ReportType } from "@/types/database"

interface CreateReportRequest {
  questionId: string
  reportType: string
  description?: string | null
}

/**
 * POST /api/reports
 * 
 * Create a new error report for a question.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreateReportRequest = await request.json()
    const { questionId, reportType, description } = body

    // Validate required fields
    if (!questionId || !reportType) {
      return NextResponse.json(
        { error: "Question ID and report type are required" },
        { status: 400 }
      )
    }

    // Validate report type
    const validReportTypes = Object.values(ReportType)
    if (!validReportTypes.includes(reportType as ReportType)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      )
    }

    // Check if question exists
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    // Check rate limiting (max 10 reports per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todaysReports, error: countError } = await supabase
      .from("error_reports")
      .select("id", { count: "exact" })
      .eq("reported_by", user.id)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())

    if (countError) {
      console.error("Error checking report count:", countError)
      return NextResponse.json(
        { error: "Failed to validate request" },
        { status: 500 }
      )
    }

    if (todaysReports && todaysReports.length >= 10) {
      return NextResponse.json(
        { error: "Daily report limit reached. Please try again tomorrow." },
        { status: 429 }
      )
    }

    // Check for duplicate reports (same user, same question, within 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: existingReport, error: duplicateError } = await supabase
      .from("error_reports")
      .select("id")
      .eq("reported_by", user.id)
      .eq("question_id", questionId)
      .gte("created_at", yesterday.toISOString())
      .single()

    if (duplicateError && duplicateError.code !== "PGRST116") {
      console.error("Error checking for duplicates:", duplicateError)
    }

    if (existingReport) {
      return NextResponse.json(
        { error: "You've already reported an issue with this question recently." },
        { status: 409 }
      )
    }

    // Create the error report
    const { data: report, error: createError } = await supabase
      .from("error_reports")
      .insert({
        question_id: questionId,
        reported_by: user.id,
        report_type: reportType as ReportType,
        description: description || "",
        status: "pending",
      })
      .select("id")
      .single()

    if (createError) {
      console.error("Error creating report:", createError)
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        reportId: report.id,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error in reports API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
