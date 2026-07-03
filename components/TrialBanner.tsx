'use client'

import Link from 'next/link'
import { AlertCircle, Clock, Zap } from 'lucide-react'

interface TrialBannerProps {
  status: 'trial' | 'active' | 'expired'
  daysRemaining?: number
}

export function TrialBanner({ status, daysRemaining = 0 }: TrialBannerProps) {
  // Active subscription with more than 3 days left — no banner needed
  if (status === 'active' && daysRemaining > 3) return null

  // Active subscription expiring soon (≤ 3 days)
  if (status === 'active' && daysRemaining > 1) {
    return (
      <Banner
        variant="amber"
        icon={<Clock className="w-4 h-4 text-amber-600 shrink-0" />}
        message={
          <>
            Your subscription expires in{' '}
            <span className="font-bold">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
            {' '}— renew now to avoid interruption
          </>
        }
        cta="Renew Plan →"
      />
    )
  }

  // Last day — active or trial
  if (daysRemaining === 1) {
    return (
      <Banner
        variant="red"
        icon={<AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
        message={
          <>
            <span className="font-bold">Your account expires tonight at midnight</span>
            {' '}— subscribe now to keep access
          </>
        }
        cta="Subscribe Now →"
      />
    )
  }

  // Trial with more than 3 days left — soft amber
  if (status === 'trial' && daysRemaining > 3) {
    return (
      <Banner
        variant="teal"
        icon={<Zap className="w-4 h-4 text-teal-600 shrink-0" />}
        message={
          <>
            Free trial —{' '}
            <span className="font-bold">{daysRemaining} days</span> remaining
          </>
        }
        cta="View Plans →"
      />
    )
  }

  // Trial with 2–3 days left — amber warning
  if (status === 'trial' && daysRemaining > 1) {
    return (
      <Banner
        variant="amber"
        icon={<Clock className="w-4 h-4 text-amber-600 shrink-0" />}
        message={
          <>
            Trial ends in{' '}
            <span className="font-bold">{daysRemaining} days</span>
            {' '}— choose a plan to keep your data
          </>
        }
        cta="View Plans →"
      />
    )
  }

  // Expired (trial or subscription) — red blocker
  return (
    <Banner
      variant="red"
      icon={<AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
      message={
        <span className="font-bold">
          Your {status === 'trial' ? 'free trial' : 'subscription'} has ended — subscribe to continue
        </span>
      }
      cta="Subscribe Now →"
    />
  )
}

// ─── Internal Banner UI ────────────────────────────────────────────────────

type Variant = 'teal' | 'amber' | 'red'

const styles: Record<Variant, { wrap: string; cta: string }> = {
  teal: {
    wrap: 'border-teal-200 bg-teal-50 text-teal-800',
    cta: 'text-teal-700 border-teal-300 hover:bg-teal-100',
  },
  amber: {
    wrap: 'border-amber-300 bg-amber-50 text-amber-800',
    cta: 'text-amber-700 border-amber-400 hover:bg-amber-100',
  },
  red: {
    wrap: 'border-red-300 bg-red-50 text-red-700',
    cta: 'text-red-700 border-red-400 hover:bg-red-100',
  },
}

function Banner({
  variant,
  icon,
  message,
  cta,
}: {
  variant: Variant
  icon: React.ReactNode
  message: React.ReactNode
  cta: string
}) {
  const s = styles[variant]
  return (
    <div className={`mx-4 mt-3 md:mx-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 shrink-0 ${s.wrap}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <p className="text-sm font-medium truncate">{message}</p>
      </div>
      <Link
        href="/subscribe"
        className={`text-xs font-semibold border rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors shrink-0 ${s.cta}`}
      >
        {cta}
      </Link>
    </div>
  )
}
