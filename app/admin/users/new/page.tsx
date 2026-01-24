/**
 * Add New User Page - Admin
 * 
 * Form to manually create new user accounts from admin panel.
 * Useful for customer support, testing, or onboarding clients.
 * 
 * @module app/admin/users/new/page
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AddUserForm from '@/components/admin/users/AddUserForm'

export const metadata = {
  title: 'Add New User | Admin',
  description: 'Create a new user account',
}

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
          <p className="text-gray-500">
            Create a new parent account with initial child profile
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Enter parent account information and first child profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddUserForm />
        </CardContent>
      </Card>
    </div>
  )
}
