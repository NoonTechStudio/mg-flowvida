'use server'

import { prisma } from './db'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export type SubscriptionStatus = 'trial' | 'active' | 'expired'
export type SubscriptionPlan = 'starter' | 'growth' | 'pro'

export async function getTenantSubscriptionStatus(
  tenantId: string
): Promise<SubscriptionStatus> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
      subscriptionEndDate: true,
    },
  })

  if (!tenant) return 'expired'

  const now = new Date()

  if (now < tenant.trialEndDate) return 'trial'

  if (
    tenant.subscriptionStatus === 'active' &&
    tenant.subscriptionEndDate &&
    now < tenant.subscriptionEndDate
  ) {
    return 'active'
  }

  return 'expired'
}

export async function getTrialDaysRemaining(
  trialEndDate: Date | string
): Promise<number> {
  const end = new Date(trialEndDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000))
}

export async function isSubscriptionValid(tenantId: string): Promise<boolean> {
  const status = await getTenantSubscriptionStatus(tenantId)
  return status === 'trial' || status === 'active'
}

export async function updateSubscription(
  plan: SubscriptionPlan,
  durationDays: number,
  razorpayPaymentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { success: false, error: 'Not authenticated' }

    const tenantId = session.user.tenantId
    const now = new Date()
    const endDate = new Date(now.getTime() + durationDays * 86_400_000)

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        razorpayPaymentId: razorpayPaymentId ?? null,
      },
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
