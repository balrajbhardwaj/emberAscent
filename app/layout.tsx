import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ember Ascent - 11+ Exam Preparation",
  description:
    "Free UK 11+ exam preparation for Year 4-5 students. Practice questions aligned with National Curriculum objectives.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Impersonation banner is rendered globally so admins never miss their current context */}
        <ImpersonationBanner />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
