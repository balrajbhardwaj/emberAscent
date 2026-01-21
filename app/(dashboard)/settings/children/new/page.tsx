/**
 * Add New Child Page
 * 
 * Allows parents to add additional children to their account.
 * Accessible from the dashboard when the user already has children.
 * 
 * @module app/(dashboard)/settings/children/new/page
 */
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, UserPlus } from "lucide-react"

import { getCurrentUser } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChildSetupForm } from "@/components/setup/ChildSetupForm"

export default async function AddChildPage() {
  // Check if user is authenticated
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Back button */}
        <Link href="/practice">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Add a New Child
            </h1>
          </div>
          <p className="text-slate-600 ml-15">
            Create a learning profile for another child
          </p>
        </div>

        {/* Setup card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Child&apos;s Learning Profile</CardTitle>
            <CardDescription>
              Enter your child&apos;s details to personalize their learning experience and track their progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChildSetupForm />
          </CardContent>
        </Card>

        {/* Info message */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Each child gets their own personalized practice sessions and progress tracking. 
            You can switch between children using the dropdown in the header.
          </p>
        </div>
      </div>
    </div>
  )
}
