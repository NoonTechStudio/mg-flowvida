'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowRight, Eye, EyeOff, Phone, Lock } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillPhone = searchParams.get('phone') || ''

  const [phone, setPhone] = useState(prefillPhone)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        phone: digits,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid phone number or password')
        return
      }

      router.push('/dashboard')
      router.refresh()
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
        <p className="text-white/50 text-sm mt-1">Sign in to your FlowVida dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Mobile number</label>
          <div className="flex items-center rounded-2xl px-4 h-14 gap-3 transition-all auth-field">
            <Phone className="w-4 h-4 text-white/30 shrink-0" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-base">🇮🇳</span>
              <span className="text-white/50 text-sm font-medium">+91</span>
              <div className="w-px h-5 bg-white/15" />
            </div>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1 bg-transparent text-white placeholder-white/25 text-base font-medium outline-none"
              inputMode="numeric"
              autoFocus
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white/60 text-xs font-medium ml-1">Password</label>
            <Link href="/forgot-password" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="flex items-center rounded-2xl px-4 h-14 gap-3 transition-all auth-field">
            <Lock className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/25 text-base outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/30 hover:text-white/60 transition-colors shrink-0"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
          className="w-full h-14 rounded-2xl bg-[#004741] hover:bg-[#005a52] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-[#004741]/40 disabled:opacity-60 mt-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-white/30 text-xs mt-6">
        New to FlowVida?{' '}
        <Link href="/register" className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors">
          Register your parlor
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8 text-white/50">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
