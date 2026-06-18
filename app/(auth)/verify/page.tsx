'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [demoOtp, setDemoOtp] = useState(() => {
    const fromUrl = searchParams.get('otp')
    if (fromUrl) return fromUrl
    if (typeof window !== 'undefined') return sessionStorage.getItem('demo_otp') || ''
    return ''
  })
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < text.length; i++) newOtp[i] = text[i]
    setOtp(newOtp)
    const nextEmpty = Math.min(text.length, 5)
    inputRefs.current[nextEmpty]?.focus()
  }

  const otpString = otp.join('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        phone,
        otp: otpString,
        tenantSubdomain: 'demo',
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid or expired OTP. Please try again.')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      sessionStorage.removeItem('demo_otp')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.demoOtp) {
          setDemoOtp(data.demoOtp)
          sessionStorage.setItem('demo_otp', data.demoOtp)
        }
        setSuccess('New OTP sent!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 2)}••••••${phone.slice(-2)}`
    : '+91 ••••••••••'

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-7 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white tracking-tight">Enter OTP</h2>
        <p className="text-white/50 text-sm mt-1">
          Sent to <span className="text-white/70 font-medium">{maskedPhone}</span>
        </p>
      </div>

      {demoOtp && (
        <div className="mb-5 flex items-center gap-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-3">
          <span className="text-amber-400 text-lg">🔐</span>
          <div>
            <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Demo OTP</p>
            <p className="text-white font-bold text-xl tracking-[0.25em]">{demoOtp}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        {/* 6 individual OTP boxes */}
        <div className="flex gap-2.5 justify-between" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full h-14 rounded-2xl bg-white/10 border border-white/15 text-white text-xl font-bold text-center focus:border-white/50 focus:bg-white/15 outline-none transition-all caret-transparent"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-xs pl-1">{error}</p>}
        {success && <p className="text-emerald-400 text-xs pl-1">{success}</p>}

        <button
          type="submit"
          disabled={loading || otpString.length !== 6}
          className="w-full h-14 rounded-2xl bg-[#E03020] hover:bg-[#c52a1a] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E03020]/30 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Verify & Sign In'
          )}
        </button>
      </form>

      <div className="text-center mt-6 space-y-1">
        <p className="text-white/40 text-sm">
          Didn&apos;t receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-[#E03020] font-semibold hover:text-[#f04030] transition-colors disabled:opacity-50 inline-flex items-center gap-1"
          >
            {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
            Resend
          </button>
        </p>
        <p className="text-white/25 text-xs">OTP valid for 5 minutes · Shown above in demo mode</p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8 text-white/50">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  )
}
