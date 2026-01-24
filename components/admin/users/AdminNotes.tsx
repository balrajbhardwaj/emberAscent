'use client'

/**
 * Admin Notes Component
 *
 * Support interface for admins to:
 * - View user support history
 * - Add private admin notes
 * - Track user interactions
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { addAdminNote } from '@/app/admin/users/actions'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminNotesProps {
  userId: string
}

export default function AdminNotes({ userId }: AdminNotesProps) {
  const { toast } = useToast()
  const { user: adminUser } = useAdminAuth()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddNote = async () => {
    if (!adminUser || !note.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const result = await addAdminNote(userId, note, adminUser.id)
    setLoading(false)

    if (result.success) {
      toast({
        title: 'Note Added',
        description: 'Admin note has been saved',
      })
      setNote('')
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid gap-4">
      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle>Add Admin Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (Internal Only)</Label>
            <Textarea
              id="note"
              placeholder="Enter admin note about this user..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              This note is only visible to admins and will be logged in the
              audit trail
            </p>
          </div>
          <Button
            onClick={handleAddNote}
            disabled={loading || !note.trim()}
            className="w-full"
          >
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Support Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Support Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" disabled>
            View Support Tickets (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full" disabled>
            View Email History (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full" disabled>
            View Login History (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-gray-600">
            All admin actions are logged and auditable. Notes added here are
            stored in the audit log for compliance and support tracking.
          </p>
          <p className="text-xs text-gray-500">
            Admin notes should follow data protection guidelines and not include
            sensitive information beyond what is necessary for support purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
