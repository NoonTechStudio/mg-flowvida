import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSubscriptionState } from '@/lib/trial'
import { SubscribeClient } from './SubscribeClient'

export default async function SubscribePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
      subscriptionEndDate: true,
    },
  })

  if (!tenant) redirect('/login')

  const state = getSubscriptionState(tenant)

  return (
    <SubscribeClient
      status={state.status === 'expired' ? 'expired' : state.status}
      daysRemaining={state.status !== 'expired' ? state.daysLeft : 0}
      userName={session.user.name || ''}
      userPhone={session.user.phone || ''}
    />
  )
}
