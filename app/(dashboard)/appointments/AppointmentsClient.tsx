'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, addDays, subDays, isToday } from 'date-fns'
import {
  Plus, ChevronLeft, ChevronRight, Clock, User,
  CheckCircle, XCircle, AlertCircle, UserCheck, Scissors, CalendarDays, Phone
} from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { formatCurrency, formatTime } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800',   icon: Clock },
  CHECKED_IN: { label: 'Checked In', color: 'bg-amber-100 text-amber-800', icon: UserCheck },
  IN_SERVICE: { label: 'In Service', color: 'bg-purple-100 text-purple-800', icon: Scissors },
  COMPLETED:  { label: 'Completed',  color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',     icon: XCircle },
  NO_SHOW:    { label: 'No Show',    color: 'bg-gray-100 text-gray-600',   icon: AlertCircle },
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner', MANAGER: 'Manager', STAFF: 'Stylist', RECEPTIONIST: 'Receptionist',
}

interface AppointmentsClientProps {
  tenantId: string
  userId: string
  userRole: string
  services: any[]
  staff: any[]
}

export function AppointmentsClient({ tenantId, userId, userRole, services, staff }: AppointmentsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newApptOpen, setNewApptOpen] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/appointments?date=${dateStr}`, { cache: 'no-store' })
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    const result = await updateAppointmentStatus(appointmentId, newStatus)
    if (result.success) {
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt)
      )
    }
  }

  const getNextAction = (status: string) => {
    switch (status) {
      case 'CONFIRMED':  return { label: 'Check-in',     status: 'CHECKED_IN' }
      case 'CHECKED_IN': return { label: 'Start Service', status: 'IN_SERVICE' }
      case 'IN_SERVICE': return { label: 'Complete',      status: 'COMPLETED' }
      default: return null
    }
  }

  const dateLabel = isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEE, d MMM yyyy')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-xs md:text-sm text-gray-500">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} · {dateLabel}
          </p>
        </div>
        <Dialog open={newApptOpen} onOpenChange={setNewApptOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>New Appointment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <NewAppointmentForm
              services={services}
              staff={staff}
              tenantId={tenantId}
              userRole={userRole}
              userId={userId}
              onSuccess={() => { setNewApptOpen(false); fetchAppointments() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Navigator */}
      <Card className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" style={{ color: '#004741' }} />
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm md:text-base">{dateLabel}</p>
              {!isToday(selectedDate) && (
                <p className="text-xs text-gray-400">{format(selectedDate, 'MMMM yyyy')}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {!isToday(selectedDate) && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-medium hover:underline"
              style={{ color: '#004741' }}
            >
              ← Back to today
            </button>
          </div>
        )}
      </Card>

      {/* Appointments List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
            Loading appointments…
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays className="w-10 h-10 mb-3 text-gray-200" />
            <p className="font-medium text-sm">No appointments for {dateLabel.toLowerCase()}</p>
            <p className="text-xs mt-1">Use "New Appointment" to add one</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-24">Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="w-24">Amount</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="text-right w-44">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => {
                    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.CONFIRMED
                    const StatusIcon = cfg.icon
                    const nextAction = getNextAction(apt.status)
                    const canAct = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

                    return (
                      <TableRow key={apt.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <p className="font-mono text-sm font-semibold">{formatTime(apt.startTime)}</p>
                          <p className="text-[11px] text-gray-400">{apt.service?.durationMinutes} min</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{apt.customer?.name || 'Walk-in'}</p>
                          {apt.customer?.phone && (
                            <p className="text-xs text-gray-400 font-mono">{apt.customer.phone}</p>
                          )}
                          {apt.isWalkIn && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">Walk-in</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service?.color || '#004741' }} />
                            <span className="text-sm">{apt.service?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{apt.staff?.name || <span className="text-gray-400 italic">Any</span>}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{formatCurrency(apt.service?.price || 0)}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {nextAction && canAct && (
                              <Button size="sm" className="h-7 text-xs px-3"
                                onClick={() => handleStatusUpdate(apt.id, nextAction.status)}>
                                {nextAction.label}
                              </Button>
                            )}
                            {apt.status === 'CONFIRMED' && canAct && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-red-500 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(apt.id, 'NO_SHOW')}>
                                No Show
                              </Button>
                            )}
                            {apt.status === 'CONFIRMED' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-gray-400 hover:text-gray-600"
                                onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE CARD LIST */}
            <div className="md:hidden divide-y divide-gray-100">
              {appointments.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.CONFIRMED
                const StatusIcon = cfg.icon
                const nextAction = getNextAction(apt.status)
                const canAct = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

                return (
                  <div key={apt.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg px-3 py-1.5 text-center" style={{ backgroundColor: 'rgba(0,71,65,0.08)' }}>
                        <p className="text-sm font-bold font-mono" style={{ color: '#004741' }}>{formatTime(apt.startTime)}</p>
                        <p className="text-[10px] text-gray-500">{apt.service?.durationMinutes} min</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.customer?.name || 'Walk-in'}</p>
                        {apt.customer?.phone && (
                          <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />{apt.customer.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service?.color || '#004741' }} />
                          <p className="text-sm text-gray-700">{apt.service?.name}</p>
                        </div>
                        {apt.staff?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">with {apt.staff.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(apt.service?.price || 0)}</span>
                      <div className="flex gap-1.5">
                        {nextAction && canAct && (
                          <Button size="sm" className="h-7 text-xs"
                            onClick={() => handleStatusUpdate(apt.id, nextAction.status)}>
                            {nextAction.label}
                          </Button>
                        )}
                        {apt.status === 'CONFIRMED' && canAct && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(apt.id, 'NO_SHOW')}>
                            No Show
                          </Button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400"
                            onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ─── New Appointment Form ───────────────────────────────────────────────────
function NewAppointmentForm({
  services, staff, tenantId, userRole, userId, onSuccess
}: {
  services: any[]
  staff: any[]
  tenantId: string
  userRole: string
  userId: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    staffId: userId, // default to current user
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    notes: '',
  })

  const selectedService = services.find(s => s.id === form.serviceId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.serviceId) { setError('Please select a service'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to book appointment'); return }
      onSuccess()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Customer Name</Label>
          <Input placeholder="Customer name" value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="9876543210" value={form.customerPhone} inputMode="numeric"
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        </div>
      </div>

      {/* Service — explicit display to avoid shadcn showing the raw ID */}
      <div className="space-y-1">
        <Label>Service *</Label>
        <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
          <SelectTrigger>
            {selectedService
              ? <span>{selectedService.name} — {formatCurrency(selectedService.price)}</span>
              : <span className="text-gray-400">Select a service…</span>}
          </SelectTrigger>
          <SelectContent>
            {services.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color || '#004741' }} />
                  <span>{s.name}</span>
                  <span className="text-gray-400 text-xs ml-1">— {formatCurrency(s.price)} · {s.durationMinutes} min</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={form.date}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Time</Label>
          <Input type="time" value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>

      {/* Staff assignment — all roles visible with label */}
      <div className="space-y-1">
        <Label>Assign Staff</Label>
        <Select
          value={form.staffId}
          onValueChange={(v) => {
            // STAFF role cannot assign to owner (owner is read-only for them)
            if (userRole === 'STAFF') {
              const person = staff.find(s => s.id === v)
              if (person?.role === 'OWNER') return
            }
            setForm({ ...form, staffId: v })
          }}
        >
          <SelectTrigger>
            {form.staffId
              ? (() => {
                  const p = staff.find(s => s.id === form.staffId)
                  return p
                    ? <span>{p.name} <span className="text-gray-400 text-xs">({ROLE_LABEL[p.role] ?? p.role})</span></span>
                    : <span className="text-gray-400">Any available</span>
                })()
              : <span className="text-gray-400">Any available</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any available</SelectItem>
            {staff
              .filter(p => !(userRole === 'STAFF' && p.role === 'OWNER'))
              .map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{p.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      p.role === 'OWNER' ? 'bg-violet-100 text-violet-700' :
                      p.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                      p.role === 'RECEPTIONIST' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {ROLE_LABEL[p.role] ?? p.role}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {userRole === 'STAFF' && (
          <p className="text-xs text-gray-400">You can assign to yourself or other staff. Owner assignment is managed by the owner.</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label>Notes (optional)</Label>
        <Input placeholder="Any special requests or notes…" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      {/* Service summary */}
      {selectedService && (
        <div className="rounded-lg p-3 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(0,71,65,0.06)', border: '1px solid rgba(0,71,65,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedService.color || '#004741' }} />
            <span className="text-sm font-medium" style={{ color: '#004741' }}>{selectedService.name}</span>
            <span className="text-xs text-gray-500">{selectedService.durationMinutes} min</span>
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
