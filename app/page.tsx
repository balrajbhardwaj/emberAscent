import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Ember Ascent
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          UK 11+ Exam Preparation for Year 4-5 Students
        </p>
        <p className="mb-12 text-lg text-gray-700">
          Free learning content for all children. Practice questions aligned
          with National Curriculum objectives.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
