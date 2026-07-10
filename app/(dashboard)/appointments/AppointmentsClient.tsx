'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { format, isToday, isTomorrow } from 'date-fns'
import {
  Plus, Clock, UserCheck, Scissors, CheckCircle,
  XCircle, AlertCircle, CalendarDays, Phone, Download
} from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { formatCurrency, formatTime } from '@/lib/utils'

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string; icon: any }> = {
  CONFIRMED:  { label: 'Confirmed',  dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700',      icon: Clock },
  CHECKED_IN: { label: 'Checked In', dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',    icon: UserCheck },
  IN_SERVICE: { label: 'In Service', dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700',  icon: Scissors },
  COMPLETED:  { label: 'Completed',  dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700',icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  dot: 'bg-red-400',     badge: 'bg-red-50 text-red-500',        icon: XCircle },
  NO_SHOW:    { label: 'No Show',    dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-500',     icon: AlertCircle },
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner', MANAGER: 'Manager', STAFF: 'Stylist', RECEPTIONIST: 'Receptionist',
}

type Tab = 'today' | 'tomorrow' | 'upcoming'

interface AppointmentsClientProps {
  tenantId: string
  userId: string
  userRole: string
  services: any[]
  staff: any[]
}

export function AppointmentsClient({ tenantId, userId, userRole, services, staff }: AppointmentsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [appointments, setAppointments] = useState<Record<Tab, any[]>>({ today: [], tomorrow: [], upcoming: [] })
  const [counts, setCounts] = useState<Record<Tab, number>>({ today: 0, tomorrow: 0, upcoming: 0 })
  const [loading, setLoading] = useState(true)
  const [newApptOpen, setNewApptOpen] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Single API call returns today + tomorrow + upcoming in one DB round-trip
      const res  = await fetch('/api/appointments?week=true')
      const data = await res.json()
      const today    = data.today    || []
      const tomorrow = data.tomorrow || []
      const upcoming = data.upcoming || []
      setAppointments({ today, tomorrow, upcoming })
      setCounts({ today: today.length, tomorrow: tomorrow.length, upcoming: upcoming.length })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleStatus = async (id: string, status: string, tab: Tab) => {
    const res = await updateAppointmentStatus(id, status)
    if (res.success) {
      setAppointments(prev => ({
        ...prev,
        [tab]: prev[tab].map(a => a.id === id ? { ...a, status } : a),
      }))
    }
  }

  const nextAction = (status: string) => {
    if (status === 'CONFIRMED')  return { label: 'Check-in', to: 'CHECKED_IN' }
    if (status === 'CHECKED_IN') return { label: 'Start',    to: 'IN_SERVICE' }
    if (status === 'IN_SERVICE') return { label: 'Complete', to: 'COMPLETED' }
    return null
  }

  // Group upcoming appointments by date
  const upcomingGrouped = appointments.upcoming.reduce<Record<string, any[]>>((acc, apt) => {
    const label = new Date(apt.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'short',
    })
    if (!acc[label]) acc[label] = []
    acc[label].push(apt)
    return acc
  }, {})

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today',    label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'upcoming', label: 'Upcoming' },
  ]

  const currentList = appointments[activeTab]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Dialog open={newApptOpen} onOpenChange={setNewApptOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="w-4 h-4 mr-1.5" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
            <NewAppointmentForm
              services={services} staff={staff} tenantId={tenantId}
              userRole={userRole} userId={userId}
              onSuccess={(newApt: any) => {
                setNewApptOpen(false)
                // Optimistic insert — no refetch needed
                const aptDate = new Date(newApt.appointmentDate)
                const tab: Tab = isToday(aptDate) ? 'today' : isTomorrow(aptDate) ? 'tomorrow' : 'upcoming'
                setAppointments(prev => ({
                  ...prev,
                  [tab]: [...prev[tab], newApt].sort(
                    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                  ),
                }))
                setCounts(prev => ({ ...prev, [tab]: prev[tab] + 1 }))
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-500 hover:text-gray-800 border border-gray-200'
            }`}
            style={activeTab === tab.key ? { backgroundColor: '#004741' } : {}}
          >
            {tab.label}
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : counts[tab.key] > 0 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            Loading…
          </div>
        ) : activeTab !== 'upcoming' ? (
          /* Today / Tomorrow flat list */
          currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-3 text-gray-200" />
              <p className="text-sm font-medium">No appointments {activeTab === 'today' ? 'today' : 'tomorrow'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {currentList.map(apt => (
                <AppointmentRow
                  key={apt.id} apt={apt} tab={activeTab}
                  userId={userId} userRole={userRole}
                  onStatus={handleStatus} nextAction={nextAction}
                  showDate={false}
                />
              ))}
            </div>
          )
        ) : (
          /* Upcoming — grouped by date */
          Object.keys(upcomingGrouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-3 text-gray-200" />
              <p className="text-sm font-medium">No upcoming appointments in the next 7 days</p>
            </div>
          ) : (
            <div>
              {Object.entries(upcomingGrouped).map(([dateLabel, apts]) => (
                <div key={dateLabel}>
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dateLabel}</span>
                    <span className="ml-auto text-[11px] text-gray-400">{apts.length} appointment{apts.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {apts.map(apt => (
                      <AppointmentRow
                        key={apt.id} apt={apt} tab={activeTab}
                        userId={userId} userRole={userRole}
                        onStatus={handleStatus} nextAction={nextAction}
                        showDate={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  )
}

// ── Single appointment row ──────────────────────────────────────────────────
function AppointmentRow({
  apt, tab, userId, userRole, onStatus, nextAction, showDate,
}: {
  apt: any; tab: Tab; userId: string; userRole: string
  onStatus: (id: string, s: string, t: Tab) => void
  nextAction: (s: string) => { label: string; to: string } | null
  showDate: boolean
}) {
  const cfg = STATUS_CFG[apt.status] || STATUS_CFG.CONFIRMED
  const Icon = cfg.icon
  const next = nextAction(apt.status)
  const canAct = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
      {/* Time */}
      <div className="shrink-0 min-w-[56px] text-right">
        <p className="font-mono font-bold text-sm">{formatTime(apt.startTime)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{apt.service?.durationMinutes}m</p>
      </div>

      {/* Dot + line */}
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <div className="w-px bg-gray-100 mt-1" style={{ minHeight: 28 }} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900">{apt.customer?.name || 'Walk-in'}</p>
            {apt.customer?.phone && (
              <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />{apt.customer.phone}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {apt.service?.color && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service.color }} />
              )}
              <span className="text-xs text-gray-500">{apt.service?.name}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs font-semibold text-gray-700">{formatCurrency(apt.service?.price || 0)}</span>
              {apt.staff?.name && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-[11px] text-gray-400">with {apt.staff.name}</span>
                </>
              )}
            </div>
          </div>

          <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
            <Icon className="w-3 h-3" />{cfg.label}
          </span>
        </div>

        {canAct && (next || apt.status === 'CONFIRMED') && (
          <div className="flex gap-1.5 mt-2">
            {next && (
              <Button size="sm" className="h-6 text-[11px] px-2.5"
                onClick={() => onStatus(apt.id, next.to, tab)}>
                {next.label}
              </Button>
            )}
            {apt.status === 'CONFIRMED' && (
              <>
                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-red-500 hover:bg-red-50"
                  onClick={() => onStatus(apt.id, 'NO_SHOW', tab)}>
                  No Show
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-gray-400 hover:text-gray-600"
                  onClick={() => onStatus(apt.id, 'CANCELLED', tab)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── New Appointment Form ────────────────────────────────────────────────────
function NewAppointmentForm({ services, staff, tenantId, userRole, userId, onSuccess }: {
  services: any[]; staff: any[]; tenantId: string; userRole: string; userId: string; onSuccess: (apt: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', serviceId: '',
    staffId: userId, date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', notes: '',
  })
  const selectedService = services.find(s => s.id === form.serviceId)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.serviceId) { setError('Please select a service'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      onSuccess(data.appointment)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Customer Name</Label>
          <Input placeholder="Name" value={form.customerName}
            onChange={e => setForm({ ...form, customerName: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="9876543210" value={form.customerPhone} inputMode="numeric"
            onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Service *</Label>
        <Select value={form.serviceId} onValueChange={v => setForm({ ...form, serviceId: v })}>
          <SelectTrigger>
            {selectedService
              ? <span>{selectedService.name} — {formatCurrency(selectedService.price)}</span>
              : <span className="text-gray-400">Select a service…</span>}
          </SelectTrigger>
          <SelectContent>
            {services.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#004741' }} />
                  <span>{s.name}</span>
                  <span className="text-gray-400 text-xs">— {formatCurrency(s.price)} · {s.durationMinutes}m</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={form.date} min={format(new Date(), 'yyyy-MM-dd')}
            onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Time</Label>
          <Input type="time" value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Assign Staff</Label>
        <Select value={form.staffId} onValueChange={v => setForm({ ...form, staffId: v })}>
          <SelectTrigger>
            {form.staffId
              ? (() => { const p = staff.find(s => s.id === form.staffId); return p ? <span>{p.name} <span className="text-gray-400 text-xs">({ROLE_LABEL[p.role] ?? p.role})</span></span> : <span className="text-gray-400">Any available</span> })()
              : <span className="text-gray-400">Any available</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any available</SelectItem>
            {staff.filter(p => !(userRole === 'STAFF' && p.role === 'OWNER')).map(p => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span>{p.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    p.role === 'OWNER' ? 'bg-violet-100 text-violet-700' :
                    p.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                    p.role === 'RECEPTIONIST' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{ROLE_LABEL[p.role] ?? p.role}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Notes (optional)</Label>
        <Input placeholder="Special requests…" value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })} />
      </div>

      {selectedService && (
        <div className="rounded-lg p-3 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(0,71,65,0.06)', border: '1px solid rgba(0,71,65,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedService.color || '#004741' }} />
            <span className="text-sm font-medium" style={{ color: '#004741' }}>{selectedService.name}</span>
            <span className="text-xs text-gray-500">{selectedService.durationMinutes}m</span>
          </div>
          <span className="font-bold text-sm" style={{ color: '#004741' }}>{formatCurrency(selectedService.price)}</span>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading || !form.serviceId}>
        {loading ? 'Booking…' : 'Book Appointment'}
      </Button>
    </form>
  )
}
