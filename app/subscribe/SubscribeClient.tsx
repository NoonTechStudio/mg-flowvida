'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Loader2, Users, Zap, Crown } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    seats: '1 Owner + 2 Staff',
    icon: Zap,
    badge: null,
    features: ['Appointments & Calendar', 'Customer Management', 'Revenue Tracking', 'Services Management'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 499,
    seats: '1 Owner + 4 Staff',
    icon: Users,
    badge: 'Most Popular',
    features: ['Everything in Starter', 'Up to 4 Staff Logins', 'Staff Performance Reports', 'Priority Support'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 799,
    seats: '1 Owner + 9 Staff',
    icon: Crown,
    badge: 'Best Value',
    features: ['Everything in Premium', 'Up to 9 Staff Logins', 'Advanced Analytics', 'Dedicated Onboarding'],
  },
] as const

type PlanId = 'starter' | 'premium' | 'business'

interface Props {
  status: 'trial' | 'active' | 'expired'
  daysRemaining: number
  userName: string
  userPhone: string
}

export function SubscribeClient({ status, daysRemaining, userName, userPhone }: Props) {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)

  const handleSubscribe = async (planId: PlanId) => {
    setLoadingPlan(planId)

    try {
      // Load Razorpay Checkout.js if not already present
      if (typeof (window as any).Razorpay === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.head.appendChild(script)
        })
      }

      // Create a fresh order server-side — never reuse a link (playbook §1)
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!res.ok) throw new Error('Failed to create order')

      const { order_id, amount, currency, plan_label, razorpay_key } = await res.json()

      const rzp = new (window as any).Razorpay({
        key: razorpay_key,
        amount,
        currency,
        name: 'FlowVida',
        description: `${plan_label} Plan — 1 Month`,
        image: '/Logo.png',
        order_id,
        prefill: {
          name: userName,
          contact: `+91${userPhone}`,
        },
        theme: { color: '#004741' },
        handler: () => {
          // Payment captured client-side — webhook activates subscription server-side
          // Redirect to a "payment received" holding page
          router.push('/subscribe/success')
        },
      })

      rzp.on('payment.failed', (resp: any) => {
        console.error('Payment failed:', resp.error)
        setLoadingPlan(null)
      })

      rzp.open()
      setLoadingPlan(null)
    } catch (err) {
      console.error('Checkout error:', err)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#004741' }}>
      <div className="mx-auto max-w-lg px-4 py-10 pb-16">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={140} height={48} className="object-contain" priority />
        </div>

        {/* Status heading */}
        <div className="text-center mb-10">
          {status === 'trial' && daysRemaining > 0 ? (
            <>
              <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'rgba(240,237,228,0.6)' }}>
                Free trial active
              </p>
              <div className="flex items-end justify-center gap-2 mb-1">
                <span className="text-7xl font-black leading-none" style={{ color: '#F0EDE4' }}>{daysRemaining}</span>
                <span className="text-xl font-semibold pb-2" style={{ color: '#F0EDE4' }}>days left</span>
              </div>
              <p className="text-sm mt-2" style={{ color: 'rgba(240,237,228,0.55)' }}>
                Subscribe now to keep your data and bookings
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold mb-2" style={{ color: '#F0EDE4' }}>
                {status === 'active' ? 'Renew your subscription' : 'Your access has ended'}
              </p>
              <p className="text-sm" style={{ color: 'rgba(240,237,228,0.55)' }}>
                {status === 'active'
                  ? 'Pick a plan below to continue without interruption'
                  : 'Subscribe below to restore full access to FlowVida'}
              </p>
            </>
          )}

          {/* Feature list */}
          <ul className="mt-6 space-y-2 text-left inline-block">
            {['Appointments & Calendar', 'Customer Database', 'Staff Management', 'Revenue Reports'].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#F0EDE4' }} />
                <span className="text-sm font-medium" style={{ color: '#F0EDE4' }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plan cards */}
        <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase mb-5"
          style={{ color: 'rgba(240,237,228,0.5)' }}>
          Choose your plan
        </p>

        <div className="flex flex-col gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id
            const isFeatured = plan.id === 'premium'

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-5 shadow-lg relative ${isFeatured ? 'border-2' : ''}`}
                style={{
                  backgroundColor: '#F0EDE4',
                  color: '#004741',
                  ...(isFeatured ? { borderColor: '#004741', transform: 'scale(1.02)' } : {}),
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wide px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-start justify-between mb-3 mt-1">
                  <div>
                    <p className="font-bold text-lg leading-tight">{plan.name}</p>
                    <p className="text-xs opacity-55 mt-0.5">{plan.seats}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black leading-none">₹{plan.price}</p>
                    <p className="text-xs opacity-50 mt-0.5">/month</p>
                  </div>
                </div>

                <ul className="mb-4 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs opacity-65">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#004741' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlan !== null}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</>
                  ) : (
                    <>Subscribe — ₹{plan.price}/mo</>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Trust note */}
        <p className="mt-10 text-center text-xs leading-relaxed" style={{ color: 'rgba(240,237,228,0.4)' }}>
          No card needed during trial · Cancel anytime · Payments secured by Razorpay
        </p>

        <p className="mt-3 text-center text-xs">
          <a
            href="https://wa.me/918000403090"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-opacity hover:opacity-90"
            style={{ color: 'rgba(240,237,228,0.45)' }}
          >
            Having trouble? WhatsApp us
          </a>
        </p>
      </div>
    </div>
  )
}
