'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Phone, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
        return
      }

      setSent(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#004741] opacity-15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={120} height={40} className="object-contain" priority />
        </div>

        <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[#004741]/40 border border-[#004741]/50 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
              <p className="text-white/45 text-sm">
                If an account exists for that number, a reset link has been sent to the registered email address.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-6 text-white/55 hover:text-white/80 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-white font-bold text-xl">Forgot password?</h2>
                <p className="text-white/45 text-sm mt-1">
                  Enter your registered mobile number. We'll send a reset link to your email.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Mobile number</label>
                  <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-2xl px-4 h-14 gap-3 focus-within:border-white/30 focus-within:bg-white/[0.09] transition-all">
                    <Phone className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="text-base shrink-0">🇮🇳</span>
                    <span className="text-white/50 text-sm font-medium shrink-0">+91</span>
                    <div className="w-px h-5 bg-white/15 shrink-0" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      inputMode="numeric"
                      autoFocus
                      className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-[#004741] hover:bg-[#005a52] active:scale-[0.98] transition-all font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#004741]/40 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 mt-5 text-white/35 hover:text-white/60 text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
