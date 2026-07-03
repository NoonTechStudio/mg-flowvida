import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Amount in paise (₹1 = 100 paise)
const PLAN_CONFIG = {
  starter:  { amount: 29900, label: 'Starter',  months: 1 },
  premium:  { amount: 49900, label: 'Premium',  months: 1 },
  business: { amount: 79900, label: 'Business', months: 1 },
} as const

type PlanId = keyof typeof PLAN_CONFIG

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    const planId = (body.plan in PLAN_CONFIG ? body.plan : 'starter') as PlanId
    const { amount, label, months } = PLAN_CONFIG[planId]

    const tenantId = session.user.tenantId

    // Dynamically import Razorpay to avoid build issues if SDK not installed
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      notes: {
        tenant_id: tenantId,
        plan_id: planId,
        plan_months: String(months),
        user_name: session.user.name || '',
        user_phone: session.user.phone || '',
      },
    })

    return NextResponse.json({
      order_id: order.id,
      amount,
      currency: 'INR',
      plan_label: label,
      razorpay_key: process.env.RAZORPAY_KEY_ID!,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
