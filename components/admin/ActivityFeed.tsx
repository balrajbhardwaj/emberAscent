/**
 * ActivityFeed Component
 *
 * Shows recent admin actions pulled from admin_audit_log.
 */

import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditLogEntry } from '@/lib/admin/auditLog'
import { Badge } from '@/components/ui/badge'

interface ActivityFeedProps {
  entries: AuditLogEntry[]
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Recent admin activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-slate-500">No admin actions logged yet.</p>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {entry.entityType.replace('_', ' ')}
              </Badge>
            </div>
            {entry.changes && (
              <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs text-slate-600">
                {JSON.stringify(entry.changes, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
