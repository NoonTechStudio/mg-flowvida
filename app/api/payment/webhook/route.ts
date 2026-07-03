import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  // Verify signature — timing-safe compare (playbook §2)
  const computed = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  let valid = false
  try {
    const a = Buffer.from(computed, 'hex')
    const b = Buffer.from(signature, 'hex')
    valid = a.length > 0 && a.length === b.length && timingSafeEqual(a, b)
  } catch {
    valid = false
  }

  if (!valid) {
    console.error('[Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const body = JSON.parse(rawBody)

  if (body.event === 'payment.captured') {
    const entity = body.payload.payment.entity
    const paymentId: string = entity.id
    const tenantId: string = entity.notes?.tenant_id
    const planId: string = entity.notes?.plan_id || 'starter'
    const months = parseInt(entity.notes?.plan_months ?? '1', 10) || 1

    if (!tenantId) {
      console.error('[Webhook] Missing tenant_id in payment notes')
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
    }

    // Idempotency — skip if this payment was already processed (playbook §2)
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { razorpayPaymentId: true },
    })

    if (tenant?.razorpayPaymentId === paymentId) {
      console.log('[Webhook] Duplicate event — already processed', paymentId)
      return NextResponse.json({ received: true })
    }

    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + months)

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: planId,
        subscriptionStartDate: new Date(),
        subscriptionEndDate,
        razorpayPaymentId: paymentId,
      },
    })

    console.log(`[Webhook] Subscription activated — tenant: ${tenantId}, plan: ${planId}, payment: ${paymentId}`)
  }

  if (body.event === 'payment.failed') {
    const entity = body.payload.payment.entity
    const tenantId: string = entity.notes?.tenant_id
    console.warn(`[Webhook] Payment failed — tenant: ${tenantId}, reason: ${entity.error_description}`)
  }

  return NextResponse.json({ received: true })
}
