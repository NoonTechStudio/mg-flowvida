import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SubscribeClient } from './SubscribeClient'

export default async function SubscribePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tenantId = session.user.tenantId

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
      subscriptionEndDate: true,
    },
  })

  const now = new Date()
  let status: 'trial' | 'active' | 'expired' = 'expired'
  let daysRemaining = 0

  if (tenant) {
    if (now < tenant.trialEndDate) {
      status = 'trial'
      daysRemaining = Math.max(
        0,
        Math.ceil((tenant.trialEndDate.getTime() - now.getTime()) / 86_400_000)
      )
    } else if (
      tenant.subscriptionStatus === 'active' &&
      tenant.subscriptionEndDate &&
      now < tenant.subscriptionEndDate
    ) {
      status = 'active'
    }
  }

  return <SubscribeClient status={status} daysRemaining={daysRemaining} />
}
