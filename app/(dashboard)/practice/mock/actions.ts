/**
 * Mock Test Actions
 *
 * Server actions for mock test operations
 */

'use server'

import { createMockTestSession as createSession } from '@/lib/practice/mockTestGenerator'
import { revalidatePath } from 'next/cache'

export async function createMockTestSession(templateId: string, childId: string) {
  const result = await createSession({
    templateId,
    childId,
  })

  if (result.success) {
    revalidatePath('/practice/mock')
    revalidatePath('/progress')
  }

  return result
}
