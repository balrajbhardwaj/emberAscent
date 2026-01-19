/**
 * Authentication Form Wrapper
 * 
 * Reusable card-based wrapper for all authentication forms.
 * Provides consistent styling and layout for login, signup, and password reset pages.
 * 
 * Features:
 * - Card-based layout with shadow and border
 * - Centered title and description
 * - Consistent spacing and typography
 * - Mobile-responsive design
 * 
 * @param title - Main heading for the form (e.g., "Welcome Back")
 * @param description - Subtitle text explaining the form purpose
 * @param children - Form content (inputs, buttons, etc.)
 * 
 * @example
 * <AuthForm title="Welcome Back" description="Log in to your account">
 *   <form>...</form>
 * </AuthForm>
 */
"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthForm({ title, description, children }: AuthFormProps) {
  return (
    <Card className="w-full max-w-md border-slate-200 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
