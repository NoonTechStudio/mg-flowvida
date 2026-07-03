/**
 * Calendar-day trial math (playbook §3).
 * Uses midnight-to-midnight diff so the countdown matches what the user sees
 * on a calendar — not raw hours since registration.
 *
 * Register Jul 1 → expiry Jul 8 00:00
 *   Jul 1 → 7   ("7 days left")
 *   Jul 7 → 1   ("expires tonight")
 *   Jul 8 → 0   (blocked)
 */
export function daysRemaining(expiryDate: Date | string): number {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expiry = new Date(expiryDate)
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  return Math.round((expiryMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
}

export type SubscriptionState =
  | { status: 'trial'; daysLeft: number }
  | { status: 'active'; daysLeft: number }
  | { status: 'expired' }

export function getSubscriptionState(tenant: {
  subscriptionStatus: string
  trialEndDate: Date
  subscriptionEndDate: Date | null
}): SubscriptionState {
  const now = new Date()

  if (tenant.subscriptionStatus === 'trial') {
    const daysLeft = daysRemaining(tenant.trialEndDate)
    if (daysLeft <= 0) return { status: 'expired' }
    return { status: 'trial', daysLeft }
  }

  if (tenant.subscriptionStatus === 'active' && tenant.subscriptionEndDate) {
    const daysLeft = daysRemaining(tenant.subscriptionEndDate)
    if (daysLeft <= 0) return { status: 'expired' }
    return { status: 'active', daysLeft }
  }

  return { status: 'expired' }
}

// Seat limits per plan
export const PLAN_SEATS: Record<string, number> = {
  trial:    2,  // owner + 2 staff
  starter:  2,
  premium:  4,
  business: 9,
}

export function maxStaffForPlan(plan: string): number {
  return PLAN_SEATS[plan.toLowerCase()] ?? 0
}
