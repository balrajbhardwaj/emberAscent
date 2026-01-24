/**
 * Add User Form Component
 * 
 * Form for admins to create new user accounts.
 * Creates both parent profile and initial child profile.
 * 
 * @module components/admin/users/AddUserForm
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function AddUserForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      parentEmail: formData.get('parentEmail') as string,
      parentName: formData.get('parentName') as string,
      childName: formData.get('childName') as string,
      yearGroup: formData.get('yearGroup') as string,
      subscriptionTier: formData.get('subscriptionTier') as string,
    }

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      toast({
        title: 'User created successfully',
        description: `Account created for ${data.parentEmail}`,
      })

      router.push(`/admin/users/${result.data.userId}`)
    } catch (error: any) {
      toast({
        title: 'Error creating user',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Parent Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Parent Account</h3>
        
        <div className="space-y-2">
          <Label htmlFor="parentEmail">Email Address *</Label>
          <Input
            id="parentEmail"
            name="parentEmail"
            type="email"
            placeholder="parent@example.com"
            required
          />
          <p className="text-xs text-gray-500">
            This will be used for login. A temporary password will be generated.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentName">Full Name</Label>
          <Input
            id="parentName"
            name="parentName"
            type="text"
            placeholder="John Smith"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscriptionTier">Subscription Tier</Label>
          <Select name="subscriptionTier" defaultValue="free">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="ascent">Ascent (Premium)</SelectItem>
              <SelectItem value="summit">Summit (Future)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Child Details */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900">First Child Profile</h3>
        
        <div className="space-y-2">
          <Label htmlFor="childName">Child's First Name *</Label>
          <Input
            id="childName"
            name="childName"
            type="text"
            placeholder="Emma"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearGroup">Year Group *</Label>
          <Select name="yearGroup" required>
            <SelectTrigger>
              <SelectValue placeholder="Select year group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Year 3 (Age 7-8)</SelectItem>
              <SelectItem value="4">Year 4 (Age 8-9)</SelectItem>
              <SelectItem value="5">Year 5 (Age 9-10)</SelectItem>
              <SelectItem value="6">Year 6 (Age 10-11)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        * Required fields. A welcome email with login credentials will be sent to the parent's email address.
      </p>
    </form>
  )
}
