'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Eye, EyeOff, Phone, User, Building2, MapPin, Lock } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    parlorName: '',
    ownerName: '',
    phone: '',
    area: '',
    city: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = form.phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parlorName: form.parlorName,
          ownerName: form.ownerName,
          phone: digits,
          area: form.area,
          city: form.city,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'ALREADY_REGISTERED') {
          router.push(`/login?phone=${digits}`)
          return
        }
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      // Redirect to welcome screen with parlor name
      router.push(`/welcome?name=${encodeURIComponent(form.ownerName)}&parlor=${encodeURIComponent(form.parlorName)}`)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none'
  const fieldWrap =
    'flex items-center rounded-2xl px-4 h-13 gap-3 transition-all auth-field'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Start your free trial</h2>
        <p className="text-white/50 text-sm mt-1">7 days free · No credit card required</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Parlor Name */}
        <div>
          <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Parlor / Salon name</label>
          <div className={fieldWrap}>
            <Building2 className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="e.g. Nita Beauty Parlor"
              value={form.parlorName}
              onChange={set('parlorName')}
              required
              autoFocus
              className={inputBase}
            />
          </div>
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Your name</label>
          <div className={fieldWrap}>
            <User className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="e.g. Nita Patel"
              value={form.ownerName}
              onChange={set('ownerName')}
              required
              className={inputBase}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Mobile number</label>
          <div className={fieldWrap}>
            <Phone className="w-4 h-4 text-white/30 shrink-0" />
            <span className="text-base shrink-0">🇮🇳</span>
            <span className="text-white/50 text-sm font-medium shrink-0">+91</span>
            <div className="w-px h-5 bg-white/15 shrink-0" />
            <input
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              required
              inputMode="numeric"
              className={inputBase}
            />
          </div>
        </div>

        {/* Area + City side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Area</label>
            <div className={fieldWrap}>
              <MapPin className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="Andheri West"
                value={form.area}
                onChange={set('area')}
                className={inputBase}
              />
            </div>
          </div>
          <div>
            <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">City</label>
            <div className={fieldWrap}>
              <input
                type="text"
                placeholder="Mumbai"
                value={form.city}
                onChange={set('city')}
                className={inputBase}
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Password</label>
          <div className={fieldWrap}>
            <Lock className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              className={inputBase}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors shrink-0" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Confirm password</label>
          <div className={fieldWrap}>
            <Lock className="w-4 h-4 text-white/30 shrink-0" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              required
              className={inputBase}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-white/30 hover:text-white/60 transition-colors shrink-0" tabIndex={-1}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
          className="w-full h-13 rounded-2xl bg-[#004741] hover:bg-[#005a52] active:scale-[0.98] transition-all font-semibold text-white text-base flex items-center justify-center gap-2 shadow-lg shadow-[#004741]/40 disabled:opacity-60 mt-1"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-white/30 text-xs mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
