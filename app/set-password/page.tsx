'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default function SetPasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update password')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldWrap = 'flex items-center bg-white/[0.06] border border-white/10 rounded-2xl px-4 h-14 gap-3 focus-within:border-white/30 focus-within:bg-white/[0.09] transition-all'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#004741] opacity-15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#004741] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={120} height={40} className="object-contain" priority />
        </div>

        <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#004741]/40 border border-[#004741]/50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Set your password</h2>
              <p className="text-white/45 text-xs mt-0.5">
                Hi {session?.user?.name?.split(' ')[0] || 'there'}, create a personal password to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">New password</label>
              <div className={fieldWrap}>
                <Lock className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors shrink-0" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/55 text-xs font-medium mb-1.5 ml-1">Confirm password</label>
              <div className={fieldWrap}>
                <Lock className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
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
              className="w-full h-13 rounded-2xl bg-[#004741] hover:bg-[#005a52] active:scale-[0.98] transition-all font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#004741]/40 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Save & Enter Dashboard</>}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 FlowVida by MeridianGrid
        </p>
      </div>
    </div>
  )
}
