import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

import { getCurrentUser } from "@/lib/supabase/auth-helpers"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChildSetupForm } from "@/components/setup/ChildSetupForm"

export default async function SetupPage() {
  // Check if user is authenticated
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  // Check if user already has children
  const supabase = await createClient()
  const { data: children } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", user.id)
    .eq("is_active", true)
    .limit(1)

  // If they have children, redirect to practice
  if (children && children.length > 0) {
    redirect("/practice")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      
      <div className="relative mx-auto max-w-2xl pt-12">
        {/* Welcome header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome to Ember Ascent! 🎉
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Let&apos;s set up your first child&apos;s learning profile
          </p>
        </div>

        {/* Setup card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create a Learning Profile</CardTitle>
            <CardDescription className="text-base">
              This helps us personalize the learning experience and track progress for each child.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChildSetupForm />
          </CardContent>
        </Card>

        {/* Encouragement message */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-900">
            💡 <strong>Quick tip:</strong> You can add multiple children and track each one&apos;s progress separately!
          </p>
        </div>
      </div>
    </div>
  )
}
