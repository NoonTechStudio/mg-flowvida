'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateSubscription } from '@/lib/subscription'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ── Razorpay Payment Links ──────────────────────────────────────────────────
const STARTER_LINK = 'https://rzp.io/rzp/Qv1QhNo0' // ₹299/month
const GROWTH_LINK = 'https://rzp.io/rzp/z09LQ6D'   // ₹499/month
const PRO_LINK = 'https://rzp.io/rzp/rPC4ym0'       // ₹799/month

type Plan = 'starter' | 'growth' | 'pro'

interface SubscribeClientProps {
  status: 'trial' | 'active' | 'expired'
  daysRemaining: number
}

const FEATURES = [
  'Appointment booking & calendar',
  'Customer database & history',
  'Staff management',
  'Revenue reports & analytics',
]

const PLAN_LINK: Record<Plan, string> = {
  starter: STARTER_LINK,
  growth: GROWTH_LINK,
  pro: PRO_LINK,
}

export function SubscribeClient({ status, daysRemaining }: SubscribeClientProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentId, setPaymentId] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handlePlanClick = (plan: Plan) => {
    window.open(PLAN_LINK[plan], '_blank')
    setSelectedPlan(plan)
    setShowConfirmation(true)
    setFeedback(null)
    setTimeout(() => {
      document.getElementById('confirmation-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleActivate = async () => {
    if (!selectedPlan) return
    setLoading(true)
    setFeedback(null)

    const result = await updateSubscription(selectedPlan, 30, paymentId.trim() || undefined)

    if (result.success) {
      setFeedback({
        type: 'success',
        message: 'Subscription activated! Redirecting to dashboard…',
      })
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      setFeedback({
        type: 'error',
        message: result.error ?? 'Something went wrong. Please try again.',
      })
      setLoading(false)
    }
  }

  const planLabel: Record<Plan, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: '#004741' }}
    >
      <div className="mx-auto max-w-lg px-4 py-10 pb-16">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo.png"
            alt="FlowVida"
            width={140}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        {/* ── Trial / Expired status block ─────────────────────────────── */}
        <div className="text-center mb-8">
          {status === 'trial' ? (
            <>
              <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'rgba(240,237,228,0.65)' }}>
                You&apos;ve unlocked
              </p>
              <div className="flex items-end justify-center gap-2 mb-1">
                <span className="text-7xl font-black leading-none" style={{ color: '#F0EDE4' }}>
                  {daysRemaining}
                </span>
                <span className="text-xl font-semibold pb-2" style={{ color: '#F0EDE4' }}>
                  Days Free Trial
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold mb-1" style={{ color: '#F0EDE4' }}>
                Your trial has ended
              </p>
              <p className="text-sm mb-4" style={{ color: 'rgba(240,237,228,0.65)' }}>
                Subscribe now to get back access to FlowVida
              </p>
            </>
          )}

          {/* Feature checklist */}
          <ul className="mt-5 space-y-2 text-left inline-block">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#F0EDE4' }} />
                <span className="text-sm font-medium" style={{ color: '#F0EDE4' }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Section label ─────────────────────────────────────────────── */}
        <p
          className="text-center text-xs font-semibold tracking-[0.2em] uppercase mb-5"
          style={{ color: 'rgba(240,237,228,0.6)' }}
        >
          After your trial — Pick a plan
        </p>

        {/* ── Plan cards ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Starter */}
          <div
            className="rounded-2xl p-5 shadow-lg"
            style={{ backgroundColor: '#F0EDE4', color: '#004741' }}
          >
            <p className="text-xs font-semibold tracking-wide uppercase opacity-60 mb-1">
              1 Staff Seat
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black">₹299</span>
              <span className="text-sm opacity-60">/mo</span>
            </div>
            <button
              onClick={() => handlePlanClick('starter')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Get Started →
            </button>
          </div>

          {/* Growth — featured */}
          <div
            className="rounded-2xl p-5 shadow-xl border-2 relative"
            style={{
              backgroundColor: '#F0EDE4',
              color: '#004741',
              borderColor: '#004741',
              transform: 'scale(1.02)',
            }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wide px-3 py-1 rounded-full"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Most Popular
            </span>
            <p className="text-xs font-semibold tracking-wide uppercase opacity-60 mb-1 mt-1">
              Up to 3 Staff Seats
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black">₹499</span>
              <span className="text-sm opacity-60">/mo</span>
            </div>
            <button
              onClick={() => handlePlanClick('growth')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Get Started →
            </button>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-5 shadow-lg relative"
            style={{ backgroundColor: '#F0EDE4', color: '#004741' }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wide px-3 py-1 rounded-full"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Best Value
            </span>
            <p className="text-xs font-semibold tracking-wide uppercase opacity-60 mb-1 mt-1">
              Unlimited Staff Seats
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black">₹799</span>
              <span className="text-sm opacity-60">/mo</span>
            </div>
            <button
              onClick={() => handlePlanClick('pro')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* ── Payment confirmation section ───────────────────────────────── */}
        {showConfirmation && (
          <div
            id="confirmation-section"
            className="mt-8 rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: '#F0EDE4', color: '#004741' }}
          >
            <h3 className="text-base font-bold mb-1">Completing your payment?</h3>
            <p className="text-sm opacity-70 mb-5 leading-relaxed">
              Once payment is done on Razorpay for the{' '}
              <span className="font-semibold">
                {selectedPlan ? planLabel[selectedPlan] : ''} plan
              </span>
              , click below to activate your FlowVida subscription.
            </p>

            {/* Optional payment ID */}
            <div className="mb-4 space-y-1">
              <Input
                placeholder="Enter Razorpay Payment ID (optional)"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="border-[#004741]/30 bg-white/60 placeholder:text-[#004741]/40 text-[#004741] focus-visible:ring-[#004741]/40"
              />
              <p className="text-xs opacity-50 pl-1">
                Find this in your Razorpay payment confirmation email
              </p>
            </div>

            {/* Feedback banner */}
            {feedback && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                  feedback.type === 'success'
                    ? 'bg-green-50 border border-green-300 text-green-800'
                    : 'bg-red-50 border border-red-300 text-red-700'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {feedback.message}
              </div>
            )}

            {/* Activate button */}
            <Button
              onClick={handleActivate}
              disabled={loading || feedback?.type === 'success'}
              className="w-full rounded-full py-6 text-sm font-semibold"
              style={
                loading || feedback?.type === 'success'
                  ? {}
                  : { backgroundColor: '#004741', color: '#F0EDE4' }
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating…
                </span>
              ) : (
                '✓ I Have Completed Payment'
              )}
            </Button>

            {/* WhatsApp help */}
            <p className="mt-4 text-center text-sm">
              <a
                href="https://wa.me/918000403090"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 opacity-60 hover:opacity-90 transition-opacity"
                style={{ color: '#004741' }}
              >
                Having trouble? WhatsApp us
              </a>
            </p>
          </div>
        )}

        {/* ── Bottom trust note ─────────────────────────────────────────── */}
        <p
          className="mt-8 text-center text-xs leading-relaxed"
          style={{ color: 'rgba(240,237,228,0.45)' }}
        >
          No card needed during trial · Cancel anytime · Payments secured by Razorpay
        </p>
      </div>
    </div>
  )
}
