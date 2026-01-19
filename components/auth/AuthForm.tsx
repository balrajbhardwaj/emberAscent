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
