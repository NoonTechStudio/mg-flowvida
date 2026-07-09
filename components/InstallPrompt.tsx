'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus, Download } from 'lucide-react'

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed (running in standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) return

    // Don't show if user dismissed within last 7 days
    const lastDismissed = localStorage.getItem('pwa-dismissed')
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000) return

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    const safari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)

    if (ios && safari) {
      setIsIOS(true)
      // Show after a short delay so it doesn't pop up immediately on load
      setTimeout(() => setShow(true), 3000)
      return
    }

    // Android / Chrome — listen for browser's install event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show || dismissed) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-safe animate-in slide-in-from-bottom-4 duration-300"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#004741', border: '1px solid rgba(240,237,228,0.15)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            {/* App icon */}
            <img src="/icon-192.png" alt="FlowVida" className="w-12 h-12 rounded-xl shadow-md" />
            <div>
              <p className="font-bold text-white text-sm leading-tight">Install FlowVida</p>
              <p className="text-[11px] leading-tight" style={{ color: 'rgba(240,237,228,0.7)' }}>
                Add to your home screen
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(240,237,228,0.12)' }}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* iOS instructions */}
        {isIOS ? (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs" style={{ color: 'rgba(240,237,228,0.8)' }}>
              Open like a native app — works offline, no browser bar:
            </p>
            <div className="space-y-1.5">
              <Step n={1} icon={<Share className="w-3.5 h-3.5" />} text='Tap the Share button at the bottom of Safari' />
              <Step n={2} icon={<Plus className="w-3.5 h-3.5" />} text='"Add to Home Screen"' />
              <Step n={3} icon={<span className="text-xs font-bold">✓</span>} text='Tap "Add" — FlowVida appears on your home screen' />
            </div>
          </div>
        ) : (
          /* Android install button */
          <div className="px-4 pb-4 flex items-center justify-between gap-3">
            <p className="text-xs flex-1" style={{ color: 'rgba(240,237,228,0.8)' }}>
              Works like a native app — fast launch, saved login, no browser bar.
            </p>
            <button
              onClick={handleInstall}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75"
              style={{ backgroundColor: '#F0EDE4', color: '#004741' }}
            >
              <Download className="w-4 h-4" />
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Step({ n, icon, text }: { n: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
        style={{ backgroundColor: 'rgba(240,237,228,0.15)', color: '#F0EDE4' }}
      >
        {n}
      </span>
      <span className="flex items-center gap-1 text-xs" style={{ color: '#F0EDE4' }}>
        {icon}
        {text}
      </span>
    </div>
  )
}
