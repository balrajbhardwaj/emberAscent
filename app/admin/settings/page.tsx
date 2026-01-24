/**
 * Admin Settings Page
 * 
 * Configuration and settings for the admin panel.
 * 
 * Planned features:
 * - Platform settings
 * - Admin user management
 * - System configuration
 * - Feature flags
 * 
 * @module app/admin/settings/page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export const metadata = {
  title: 'Settings | Admin',
  description: 'Admin panel configuration and settings',
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-gray-500">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SettingsIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Settings Coming Soon
            </h3>
            <p className="text-gray-500 max-w-md">
              This page will contain platform configuration options, admin user management,
              system settings, and feature flags.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
