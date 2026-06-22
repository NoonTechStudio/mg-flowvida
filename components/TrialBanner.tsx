import Link from 'next/link'
import { AlertCircle, Clock } from 'lucide-react'

interface TrialBannerProps {
  status: 'trial' | 'active' | 'expired'
  daysRemaining?: number
}

export function TrialBanner({ status, daysRemaining = 0 }: TrialBannerProps) {
  if (status === 'active') return null

  if (status === 'trial') {
    return (
      <div className="mx-4 mt-3 md:mx-6 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium truncate">
            <span className="font-bold">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
            </span>{' '}
            of free trial left — Subscribe to keep your bookings
          </p>
        </div>
        <Link
          href="/subscribe"
          className="text-xs font-semibold text-amber-700 border border-amber-400 rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-amber-100 transition-colors shrink-0"
        >
          View Plans →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3 md:mx-6 flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
        <p className="text-sm text-red-700 font-medium truncate">
          Your trial has ended. Subscribe to continue using FlowVida.
        </p>
      </div>
      <Link
        href="/subscribe"
        className="text-xs font-semibold text-red-700 border border-red-400 rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-red-100 transition-colors shrink-0"
      >
        Subscribe Now →
      </Link>
    </div>
  )
}
