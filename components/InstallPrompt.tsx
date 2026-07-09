'use client'

import { useEffect, useState } from 'react'
import { X, Share2, PlusSquare, Download, Smartphone } from 'lucide-react'

type Platform = 'ios' | 'android' | 'other'

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'other'
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return 'other'
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed — never show
    if (isInStandaloneMode()) { setInstalled(true); return }

    // Dismissed in last 3 days
    const dismissed = localStorage.getItem('fv-install-dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return

    const p = detectPlatform()
    setPlatform(p)

    if (p === 'ios') {
      // iOS Safari: show manual instructions after 2 s
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    }

    if (p === 'android') {
      // Android Chrome: capture the native prompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setTimeout(() => setVisible(true), 1500)
      }
      window.addEventListener('beforeinstallprompt', handler as any)

      // Fallback: if event never fires within 4 s, show manual instructions anyway
      const fallback = setTimeout(() => setVisible(true), 4000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler as any)
        clearTimeout(fallback)
      }
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('fv-install-dismissed', Date.now().toString())
  }

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferredPrompt(null)
    }
    dismiss()
  }

  if (installed || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999] px-3 pb-4 md:px-6 md:pb-6">
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto"
        style={{ backgroundColor: '#004741' }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-xl shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">Install FlowVida</p>
            <p className="text-xs" style={{ color: 'rgba(240,237,228,0.75)' }}>
              Works like a native app — fast &amp; offline
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* iOS — manual steps */}
          {platform === 'ios' && (
            <div className="space-y-2">
              <Step icon={<Share2 className="w-4 h-4" />}
                text={<>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari</>} />
              <Step icon={<PlusSquare className="w-4 h-4" />}
                text={<>Tap <strong className="text-white">"Add to Home Screen"</strong></>} />
              <Step icon={<Smartphone className="w-4 h-4" />}
                text={<>Tap <strong className="text-white">Add</strong> — FlowVida appears on your home screen</>} />
            </div>
          )}

          {/* Android with native prompt */}
          {platform === 'android' && deferredPrompt && (
            <button
              onClick={triggerInstall}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-opacity active:opacity-80"
              style={{ backgroundColor: '#F0EDE4', color: '#004741' }}
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}

          {/* Android without native prompt — manual instructions */}
          {platform === 'android' && !deferredPrompt && (
            <div className="space-y-2">
              <Step icon={<span className="font-bold text-xs">⋮</span>}
                text={<>Tap the <strong className="text-white">3-dot menu</strong> in Chrome (top right)</>} />
              <Step icon={<PlusSquare className="w-4 h-4" />}
                text={<>Tap <strong className="text-white">"Add to Home screen"</strong></>} />
              <Step icon={<Smartphone className="w-4 h-4" />}
                text={<>Tap <strong className="text-white">Add</strong> — done!</>} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(240,237,228,0.15)', color: '#F0EDE4' }}
      >
        {icon}
      </span>
      <span className="text-xs leading-snug" style={{ color: 'rgba(240,237,228,0.85)' }}>
        {text}
      </span>
    </div>
  )
}
