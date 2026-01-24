/**
 * Mock Test Session Actions
 *
 * Server actions for mock test operations
 */

'use server'

import { submitMockTest as submitTest } from '@/lib/practice/mockTestGenerator'
import { revalidatePath } from 'next/cache'

export async function submitMockTestSession(sessionId: string, childId: string, timeTakenSeconds: number) {
  const result = await submitTest(sessionId, childId, timeTakenSeconds)

  if (result.success) {
    revalidatePath(`/practice/mock/${sessionId}`)
    revalidatePath('/progress')
  }

  return result
}
