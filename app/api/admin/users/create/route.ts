/**
 * Admin API: Create New User
 * 
 * Endpoint for admins to create new user accounts.
 * Creates parent profile, auth user, and initial child profile.
 * 
 * @module app/api/admin/users/create/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { z } from 'zod'

const createUserSchema = z.object({
  parentEmail: z.string().email(),
  parentName: z.string().optional(),
  childName: z.string().min(2),
  yearGroup: z.string().regex(/^[3-6]$/),
  subscriptionTier: z.enum(['free', 'ascent', 'summit']).default('free'),
})

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.parentEmail)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`

    // Create auth user via Supabase Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.parentEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: validatedData.parentName || '',
      },
    })

    if (authError || !authData.user) {
      console.error('Failed to create auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: validatedData.parentEmail,
        full_name: validatedData.parentName || null,
        subscription_tier: validatedData.subscriptionTier,
        subscription_status: 'active',
      })

    if (profileError) {
      console.error('Failed to create profile:', profileError)
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Create initial child profile
    const { error: childError } = await supabase
      .from('children')
      .insert({
        parent_id: authData.user.id,
        name: validatedData.childName,
        year_group: parseInt(validatedData.yearGroup),
        avatar_url: 'boy-1',
        is_active: true,
      })

    if (childError) {
      console.error('Failed to create child:', childError)
      // Note: Profile and auth user already created - could clean up or leave
      // For now, just return error
      return NextResponse.json(
        { error: 'User created but failed to create child profile' },
        { status: 500 }
      )
    }

    // TODO: Send welcome email with temporary password
    // This would integrate with Resend or similar email service

    return NextResponse.json({
      success: true,
      data: {
        userId: authData.user.id,
        email: validatedData.parentEmail,
        tempPassword, // In production, this should be sent via email only
      },
      message: 'User created successfully',
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
