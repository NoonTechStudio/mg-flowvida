'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { CheckCircle2, ChevronRight, Clock, Scissors, MapPin, Loader2, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Service {
  id: string
  name: string
  category: string
  price: number
  durationMinutes: number
  color: string
}

interface Parlor {
  id: string
  businessName: string
  area: string | null
  city: string | null
  services: Service[]
}

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'done'

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: 'Hair', SKIN: 'Skin', BRIDAL: 'Bridal', NAILS: 'Nails', SPA: 'Spa', OTHER: 'Other',
}

function generateDates(count = 10) {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i))
}

export default function PublicBookingPage() {
  const params = useParams()
  const subdomain = Array.isArray(params.subdomain) ? params.subdomain[0] : params.subdomain

  const [parlor, setParlor]         = useState<Parlor | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const [step, setStep]             = useState<Step>('service')
  const [service, setService]       = useState<Service | null>(null)
  const [date, setDate]             = useState<Date | null>(null)
  const [slot, setSlot]             = useState<string | null>(null)
  const [slots, setSlots]           = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const dates = generateDates(10)

  useEffect(() => {
    fetch(`/api/public/parlor?subdomain=${subdomain}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setParlor(d)
      })
      .catch(() => setError('Failed to load parlor'))
      .finally(() => setLoading(false))
  }, [subdomain])

  useEffect(() => {
    if (!service || !date || !parlor) return
    setSlotsLoading(true)
    setSlot(null)
    const dateStr = format(date, 'yyyy-MM-dd')
    fetch(`/api/public/slots?tenantId=${parlor.id}&serviceId=${service.id}&date=${dateStr}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .finally(() => setSlotsLoading(false))
  }, [service, date, parlor])

  async function handleBook() {
    if (!parlor || !service || !date || !slot || !name.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: parlor.id,
          serviceId: service.id,
          date: format(date, 'yyyy-MM-dd'),
          time: slot,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      setBookingRef(data.appointment.id.slice(-6).toUpperCase())
      setStep('done')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#004741' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#F0EDE4' }} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#004741' }}>
      <div className="text-center">
        <p className="text-lg font-semibold mb-2" style={{ color: '#F0EDE4' }}>{error}</p>
        <p className="text-sm" style={{ color: 'rgba(240,237,228,0.5)' }}>Please check the link and try again.</p>
      </div>
    </div>
  )

  if (!parlor) return null

  const grouped = parlor.services.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const formatSlot = (s: string) => {
    const [h, m] = s.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3EE' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#004741' }} className="px-4 py-5 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(240,237,228,0.12)' }}>
            <Scissors className="w-5 h-5" style={{ color: '#F0EDE4' }} />
          </div>
          <div>
            <p className="font-bold text-base leading-tight" style={{ color: '#F0EDE4' }}>{parlor.businessName}</p>
            {(parlor.area || parlor.city) && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(240,237,228,0.6)' }}>
                <MapPin className="w-3 h-3" />
                {[parlor.area, parlor.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="max-w-lg mx-auto px-4 pt-5 pb-1">
          <div className="flex items-center gap-1 text-xs font-medium">
            {(['service', 'datetime', 'details', 'confirm'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  step === s ? 'text-white' : ''
                )} style={{
                  backgroundColor: step === s ? '#004741' : 'transparent',
                  border: `1.5px solid ${step === s ? '#004741' : 'rgba(0,71,65,0.3)'}`,
                  color: step === s ? 'white' : 'rgba(0,71,65,0.4)',
                }}>
                  {i + 1}
                </span>
                {i < 3 && <ChevronRight className="w-3 h-3" style={{ color: 'rgba(0,71,65,0.2)' }} />}
              </div>
            ))}
            <span className="ml-2 capitalize text-xs" style={{ color: 'rgba(0,71,65,0.5)' }}>
              {step === 'datetime' ? 'Date & Time' : step}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-4 pb-24">

        {/* STEP 1 — Service */}
        {step === 'service' && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#004741' }}>Choose a service</h2>
            {Object.entries(grouped).map(([cat, services]) => (
              <div key={cat} className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(0,71,65,0.4)' }}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="space-y-2">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => { setService(svc); setStep('datetime') }}
                      className="w-full text-left rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md active:scale-[0.99]"
                      style={{ backgroundColor: 'white', border: '1px solid rgba(0,71,65,0.1)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: svc.color }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{svc.name}</p>
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#888' }}>
                            <Clock className="w-3 h-3" /> {svc.durationMinutes} min
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-base shrink-0" style={{ color: '#004741' }}>₹{svc.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 — Date & Time */}
        {step === 'datetime' && service && (
          <div>
            <button onClick={() => setStep('service')} className="text-xs mb-4 flex items-center gap-1 hover:opacity-80" style={{ color: 'rgba(0,71,65,0.6)' }}>
              ← Back
            </button>
            <div className="rounded-xl p-4 mb-5 flex items-center justify-between" style={{ backgroundColor: 'white', border: '1px solid rgba(0,71,65,0.1)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#004741' }}>{service.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#888' }}>{service.durationMinutes} min</p>
              </div>
              <p className="font-bold" style={{ color: '#004741' }}>₹{service.price}</p>
            </div>

            <h2 className="text-lg font-bold mb-3" style={{ color: '#004741' }}>Pick a date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-5 scrollbar-none">
              {dates.map(d => {
                const selected = date && format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDate(d)}
                    className="flex-none rounded-xl px-3 py-2 text-center min-w-[56px] transition-all"
                    style={{
                      backgroundColor: selected ? '#004741' : 'white',
                      border: `1px solid ${selected ? '#004741' : 'rgba(0,71,65,0.12)'}`,
                    }}
                  >
                    <p className="text-[10px] font-medium" style={{ color: selected ? 'rgba(240,237,228,0.7)' : '#888' }}>
                      {format(d, 'EEE')}
                    </p>
                    <p className="text-base font-bold" style={{ color: selected ? '#F0EDE4' : '#1a1a1a' }}>
                      {format(d, 'd')}
                    </p>
                    <p className="text-[10px]" style={{ color: selected ? 'rgba(240,237,228,0.6)' : '#888' }}>
                      {format(d, 'MMM')}
                    </p>
                  </button>
                )
              })}
            </div>

            {date && (
              <>
                <h2 className="text-lg font-bold mb-3" style={{ color: '#004741' }}>Pick a time</h2>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#004741' }} />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#888' }}>No slots available for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {slots.map(s => (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className="rounded-xl py-2.5 text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: slot === s ? '#004741' : 'white',
                          color: slot === s ? '#F0EDE4' : '#1a1a1a',
                          border: `1px solid ${slot === s ? '#004741' : 'rgba(0,71,65,0.12)'}`,
                        }}
                      >
                        {formatSlot(s)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {date && slot && (
              <button
                onClick={() => setStep('details')}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* STEP 3 — Details */}
        {step === 'details' && (
          <div>
            <button onClick={() => setStep('datetime')} className="text-xs mb-4 flex items-center gap-1 hover:opacity-80" style={{ color: 'rgba(0,71,65,0.6)' }}>
              ← Back
            </button>
            <h2 className="text-xl font-bold mb-5" style={{ color: '#004741' }}>Your details</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: '#004741' }}>
                  <User className="w-3.5 h-3.5" /> Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: 'white', border: '1.5px solid rgba(0,71,65,0.15)', color: '#1a1a1a' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: '#004741' }}>
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: 'white', border: '1.5px solid rgba(0,71,65,0.15)', color: '#1a1a1a' }}
                />
              </div>
            </div>
            <button
              onClick={() => { if (name.trim() && phone.trim()) setStep('confirm') }}
              disabled={!name.trim() || !phone.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              Review Booking →
            </button>
          </div>
        )}

        {/* STEP 4 — Confirm */}
        {step === 'confirm' && service && date && slot && (
          <div>
            <button onClick={() => setStep('details')} className="text-xs mb-4 flex items-center gap-1 hover:opacity-80" style={{ color: 'rgba(0,71,65,0.6)' }}>
              ← Back
            </button>
            <h2 className="text-xl font-bold mb-5" style={{ color: '#004741' }}>Confirm booking</h2>

            <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: 'white', border: '1px solid rgba(0,71,65,0.1)' }}>
              <div className="px-5 py-4" style={{ backgroundColor: '#004741' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(240,237,228,0.5)' }}>Booking at</p>
                <p className="font-bold text-base" style={{ color: '#F0EDE4' }}>{parlor.businessName}</p>
              </div>
              <div className="px-5 divide-y" style={{ borderColor: 'rgba(0,71,65,0.06)' }}>
                {[
                  ['Service', service.name],
                  ['Date', format(date, 'EEE, d MMM yyyy')],
                  ['Time', formatSlot(slot)],
                  ['Duration', `${service.durationMinutes} min`],
                  ['Name', name],
                  ['Mobile', phone],
                ].map(([label, value]) => (
                  <div key={label} className="py-3 flex justify-between text-sm">
                    <span style={{ color: '#888' }}>{label}</span>
                    <span className="font-semibold" style={{ color: '#1a1a1a' }}>{value}</span>
                  </div>
                ))}
                <div className="py-3 flex justify-between text-sm font-bold">
                  <span style={{ color: '#004741' }}>Amount</span>
                  <span style={{ color: '#004741' }}>₹{service.price}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-center mb-5" style={{ color: '#999' }}>
              Payment is collected at the parlor. No advance required.
            </p>

            <button
              onClick={handleBook}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#004741', color: '#F0EDE4' }}
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : 'Confirm Appointment'}
            </button>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && service && date && slot && (
          <div className="pt-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,71,65,0.1)' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#004741' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#004741' }}>You&apos;re booked!</h2>
            <p className="text-sm mb-8" style={{ color: '#666' }}>
              Your appointment has been confirmed at {parlor.businessName}.
            </p>
            <div className="rounded-2xl p-5 mb-6 text-left" style={{ backgroundColor: 'white', border: '1px solid rgba(0,71,65,0.1)' }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(0,71,65,0.4)' }}>Booking Summary</p>
              {[
                ['Service', service.name],
                ['Date', format(date, 'EEE, d MMM yyyy')],
                ['Time', formatSlot(slot)],
                ['Ref #', bookingRef],
              ].map(([label, value]) => (
                <p key={label} className="text-sm mb-1.5">
                  <span style={{ color: '#888' }}>{label}: </span>
                  <strong style={{ color: '#1a1a1a' }}>{value}</strong>
                </p>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#999' }}>Please arrive 5 minutes before your appointment. See you soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
