import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { plan, durationDays, razorpayPaymentId } = body

    if (!plan || !durationDays) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: plan and durationDays' },
        { status: 400 }
      )
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const endDate = new Date(now.getTime() + Number(durationDays) * 86_400_000)

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

    return NextResponse.json({ success: true, message: 'Subscription activated' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
