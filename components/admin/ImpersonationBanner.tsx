/**
 * Server component wrapper that renders the impersonation banner when an admin
 * is actively viewing the product as another user.
 */
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getImpersonationInfo } from '@/lib/admin/impersonation'
import { IMPERSONATION_COOKIE_NAME } from '@/lib/admin/impersonation.constants'
import { ImpersonationBannerClient } from '@/components/admin/ImpersonationBannerClient'

export async function ImpersonationBanner() {
  const cookieJar = cookies()
  const token = cookieJar.get(IMPERSONATION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const supabase = await createClient()
  const info = await getImpersonationInfo(token, { client: supabase })

  if (!info) {
    return null
  }

  const displayName = info.targetProfile.fullName || info.targetProfile.email

  return <ImpersonationBannerClient userName={displayName} expiresAt={info.expiresAt} />
}
