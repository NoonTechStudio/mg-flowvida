'use client'

import { useState } from 'react'
import { Link2, Copy, Check, ExternalLink } from 'lucide-react'

interface BookingLinkWidgetProps {
  subdomain: string
  baseUrl?: string
}

export function BookingLinkWidget({ subdomain, baseUrl }: BookingLinkWidgetProps) {
  const [copied, setCopied] = useState(false)

  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  const bookingUrl = `${origin}/book/${subdomain}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('input')
      el.value = bookingUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#004741' }}>
          <Link2 className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#004741' }}>Online Booking Link</p>
          <p className="text-xs text-gray-500">Share with clients to receive appointments</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg p-2 pr-1" style={{ backgroundColor: 'white', border: '1px solid rgba(0,71,65,0.15)' }}>
        <p className="text-xs flex-1 truncate font-mono" style={{ color: '#004741' }}>{bookingUrl}</p>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              backgroundColor: copied ? '#004741' : 'rgba(0,71,65,0.08)',
              color: copied ? 'white' : '#004741',
            }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-all hover:bg-gray-100"
            style={{ color: '#004741' }}
            title="Open booking page"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <p className="text-xs mt-2" style={{ color: '#888' }}>
        Tip: Share via WhatsApp, Instagram bio, or your visiting card.
      </p>
    </div>
  )
}
