'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillPhone = searchParams.get('phone') || ''

  const [parlorName, setParlorName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState(prefillPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parlorName, ownerName, phone: digits }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'ALREADY_REGISTERED') {
          router.push(`/login?phone=${digits}&hint=existing`)
          return
        }
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      const params = new URLSearchParams({ phone: digits })
      if (data.demoOtp) {
        params.set('otp', data.demoOtp)
        sessionStorage.setItem('demo_otp', data.demoOtp)
      }
      router.push(`/verify?${params.toString()}`)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
        <p className="text-white/50 text-sm mt-1">Set up your parlor in under 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parlor name */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Parlor / Salon name</label>
          <input
            type="text"
            placeholder="e.g. Nita Beauty Parlor"
            value={parlorName}
            onChange={(e) => setParlorName(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/15 rounded-2xl px-4 h-14 text-white placeholder-white/30 text-base outline-none focus:border-white/40 transition-colors"
          />
        </div>

        {/* Owner name */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Your name</label>
          <input
            type="text"
            placeholder="e.g. Nita Patel"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/15 rounded-2xl px-4 h-14 text-white placeholder-white/30 text-base outline-none focus:border-white/40 transition-colors"
          />
        </div>

        {/* Mobile number */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Mobile number</label>
          <div className="flex items-center bg-white/10 border border-white/15 rounded-2xl px-4 h-14 gap-3 focus-within:border-white/40 transition-colors">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lg">🇮🇳</span>
              <span className="text-white/60 text-sm font-medium">+91</span>
              <div className="w-px h-5 bg-white/20" />
            </div>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              inputMode="numeric"
              className="flex-1 bg-transparent text-white placeholder-white/30 text-base font-medium outline-none"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs pl-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#E03020] hover:bg-[#c52a1a] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E03020]/30 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account & Get OTP
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-white/30 text-xs mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-white/50 hover:text-white/80 underline underline-offset-2 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8 text-white/50">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
