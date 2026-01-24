'use client'

/**
 * Children List Component
 *
 * Displays list of children linked to parent account with:
 * - Child profile information
 * - Practice statistics
 * - Readiness scores
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Child {
  id: string
  name: string
  year_group: number
  exam_type: string
  avatar: string
  created_at: string
  is_active: boolean
}

interface ChildrenListProps {
  childrenData: Child[]
  parentId: string
}

export default function ChildrenList({ childrenData }: ChildrenListProps) {
  if (childrenData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">
            No children profiles created yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {childrenData.map((child) => (
        <Card key={child.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{child.avatar}</div>
              <div className="flex-1">
                <CardTitle className="text-lg">{child.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  Year {child.year_group}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Exam Type</div>
              <Badge variant="outline" className="capitalize">
                {child.exam_type}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Created</div>
              <div className="text-sm">
                {formatDistanceToNow(new Date(child.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <Badge variant={child.is_active ? 'default' : 'secondary'}>
                {child.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
