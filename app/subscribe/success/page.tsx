'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(6)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#004741' }}>
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none" style={{ backgroundColor: '#F0EDE4' }} />

      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="flex justify-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={120} height={40} className="object-contain" priority />
        </div>

        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(240,237,228,0.12)' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: '#F0EDE4' }} />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#F0EDE4' }}>Payment received!</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(240,237,228,0.6)' }}>
          Your subscription is being activated. This takes just a moment.
        </p>

        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: 'rgba(240,237,228,0.08)', border: '1px solid rgba(240,237,228,0.12)' }}>
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" style={{ color: 'rgba(240,237,228,0.5)' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(240,237,228,0.7)' }}>
            Redirecting to your dashboard in <span style={{ color: '#F0EDE4' }} className="font-bold">{secondsLeft}s</span>
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm underline underline-offset-2 transition-opacity hover:opacity-80"
          style={{ color: 'rgba(240,237,228,0.5)' }}
        >
          Go to dashboard now →
        </button>
      </div>
    </div>
  )
}
