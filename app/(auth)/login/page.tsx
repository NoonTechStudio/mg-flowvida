'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP. Please try again.')
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-white/50 text-sm mt-1">Enter your registered mobile number</p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
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
              className="flex-1 bg-transparent text-white placeholder-white/30 text-base font-medium outline-none"
              inputMode="numeric"
              required
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2 pl-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#E03020] hover:bg-[#c52a1a] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E03020]/30 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-white/30 text-xs mt-6">
        A 6-digit OTP will be sent to your registered number
      </p>
    </div>
  )
}
