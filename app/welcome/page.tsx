'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Loader2, CheckCircle2, Users, Sparkles, Crown } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    seats: '1 Owner + 2 Staff',
    color: 'from-slate-600/40 to-slate-700/40',
    border: 'border-white/10',
    badge: null,
    features: ['Appointments & Calendar', 'Customer Management', 'Revenue Tracking', 'Services Management'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 499,
    seats: '1 Owner + 4 Staff',
    color: 'from-[#004741]/50 to-[#003330]/50',
    border: 'border-[#004741]/60',
    badge: 'Most Popular',
    features: ['Everything in Starter', 'Up to 4 Staff Logins', 'Staff Performance Reports', 'Priority Support'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 799,
    seats: '1 Owner + 9 Staff',
    color: 'from-amber-900/30 to-amber-950/30',
    border: 'border-amber-500/20',
    badge: 'Best Value',
    features: ['Everything in Premium', 'Up to 9 Staff Logins', 'Advanced Analytics', 'Dedicated Onboarding'],
  },
]

function WelcomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ownerName = searchParams.get('name') || 'there'
  const parlorName = searchParams.get('parlor') || 'your parlor'
  const phone = searchParams.get('phone') || ''
  const [loading, setLoading] = useState(false)

  const handleLetsGo = async () => {
    setLoading(true)
    // If phone+password were passed via query (just registered), sign in automatically
    // Otherwise just navigate to login
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-y-auto">
      {/* Background blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#004741] opacity-15 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#004741] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/Logo.png" alt="FlowVida" width={120} height={40} className="object-contain opacity-90" priority />
        </div>

        {/* Welcome hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#004741]/30 border border-[#004741]/50 rounded-full px-4 py-1.5 mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Account created successfully</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Welcome, {ownerName.split(' ')[0]}! 🎉
          </h1>
          <p className="text-white/50 text-base">
            <span className="text-white/80 font-medium">{parlorName}</span> is ready to go.
            <br />You have <span className="text-emerald-400 font-semibold">7 days free</span> to explore everything.
          </p>
        </div>

        {/* Trial badge */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#004741]/40 border border-[#004741]/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">7-Day Free Trial</p>
            <p className="text-white/45 text-xs mt-0.5">Full access · 1 Owner + 2 Staff · No credit card needed</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-white">7</p>
            <p className="text-white/40 text-xs">days left</p>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Choose a plan after trial</h2>
          </div>

          <div className="space-y-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-r ${plan.color} border ${plan.border} rounded-2xl p-5`}
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 bg-[#004741] text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-white font-bold text-lg">{plan.name}</span>
                      <span className="text-white/40 text-xs">·</span>
                      <span className="text-white/50 text-xs">{plan.seats}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {plan.features.map((f) => (
                        <span key={f} className="text-white/45 text-xs flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-xl">₹{plan.price}</p>
                    <p className="text-white/35 text-xs">/month</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleLetsGo}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#004741] hover:bg-[#005a52] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-xl shadow-[#004741]/30 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Let's Go — Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 FlowVida by{' '}
          <a href="https://www.meridiangrid.in" target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">
            MeridianGrid
          </a>
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/40">Loading…</div>}>
      <WelcomeContent />
    </Suspense>
  )
}
