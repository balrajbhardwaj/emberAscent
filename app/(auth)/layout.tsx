import { ReactNode } from "react"
import { Flame } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {/* Logo and branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ember Ascent
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            11+ Exam Preparation Platform
          </p>
        </div>

        {/* Auth form content */}
        {children}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Ember Ascent. All rights reserved.
        </p>
      </div>
    </div>
  )
}
