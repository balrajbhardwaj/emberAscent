/**
 * Admin Dashboard Page
 *
 * Summarises platform health metrics for internal teams.
 *
 * @module app/admin/page
 */
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/admin/MetricCard'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { getAuditLog } from '@/lib/admin/auditLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, PlusCircle, ShieldAlert, Users, Bug, AlertTriangle } from 'lucide-react'

async function fetchDashboardData() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalParents },
    { count: paidParents },
    { count: questionCount },
    { count: pendingReviews },
    { count: openReports },
    { count: todaysSessions },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .in('subscription_tier', ['ascent', 'summit'])
      .eq('subscription_status', 'active'),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'ai_only'),
    supabase
      .from('error_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
  ])

  const auditLog = await getAuditLog({ limit: 6 })

  return {
    totalParents: totalParents ?? 0,
    paidParents: paidParents ?? 0,
    questionCount: questionCount ?? 0,
    pendingReviews: pendingReviews ?? 0,
    openReports: openReports ?? 0,
    todaysSessions: todaysSessions ?? 0,
    auditEntries: auditLog.entries,
  }
}

export default async function AdminDashboardPage() {
  const data = await fetchDashboardData()

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total parents"
          value={data.totalParents.toLocaleString()}
          description="All registered guardians"
          trendLabel="+8% vs last 30 days"
          trendDirection="up"
          icon={<Users className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard
          title="Active subscribers"
          value={data.paidParents.toLocaleString()}
          description="Ascent + Summit"
          trendLabel="1.4% churn last week"
          trendDirection="flat"
          icon={<ArrowUpRight className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard
          title="Questions in bank"
          value={data.questionCount.toLocaleString()}
          description="Ready for delivery"
          trendLabel={`Pending reviews: ${data.pendingReviews}`}
          trendDirection={data.pendingReviews > 0 ? 'down' : 'up'}
          icon={<PlusCircle className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard
          title="Open error reports"
          value={data.openReports.toString()}
          description="Needs triage"
          trendLabel={data.openReports > 10 ? 'Backlog high' : 'Under control'}
          trendDirection={data.openReports > 10 ? 'down' : 'up'}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        />
        <MetricCard
          title="Practice sessions today"
          value={data.todaysSessions.toString()}
          description="Across all children"
          trendLabel="Refresh around 7pm"
          icon={<ShieldAlert className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard
          title="Reviews awaiting QA"
          value={data.pendingReviews.toString()}
          description="Questions flagged for human review"
          trendLabel="Assign to reviewers"
          icon={<Bug className="h-4 w-4 text-rose-500" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Quick actions</CardTitle>
              <p className="text-sm text-slate-500">Jump into the highest impact workflows</p>
            </div>
            <Button size="sm" variant="outline">
              View all
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'Review flagged questions',
                description: `${data.pendingReviews} waiting for QA`,
                href: '/admin/questions?reviewStatus=ai_only',
              },
              {
                title: 'Resolve error reports',
                description: `${data.openReports} parent reports open`,
                href: '/admin/reports',
              },
              {
                title: 'Import new content',
                description: 'Upload latest GL batch',
                href: '/admin/questions/import',
              },
              {
                title: 'Monitor practice health',
                description: `${data.todaysSessions} sessions started today`,
                href: '/admin/analytics',
              },
            ].map((card) => (
              <Card key={card.title} className="border-slate-200">
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-500">{card.description}</p>
                  <Button asChild variant="link" className="px-0 text-purple-600">
                    <a href={card.href}>Open workflow →</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <ActivityFeed entries={data.auditEntries} />
      </section>
    </div>
  )
}
