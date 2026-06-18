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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { format, addDays, subDays, isToday } from 'date-fns'
import {
  Plus, ChevronLeft, ChevronRight, Clock, User,
  CheckCircle, XCircle, AlertCircle, UserCheck, Scissors, CalendarDays
} from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { formatCurrency, formatTime } from '@/lib/utils'

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'secondary', icon: Clock },
  CHECKED_IN: { label: 'Checked In', variant: 'warning', icon: UserCheck },
  IN_SERVICE: { label: 'In Service', variant: 'default', icon: Scissors },
  COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  NO_SHOW: { label: 'No Show', variant: 'outline', icon: AlertCircle },
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
      const res = await fetch(`/api/appointments?date=${dateStr}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

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
      case 'CONFIRMED': return { label: 'Check-in', status: 'CHECKED_IN' }
      case 'CHECKED_IN': return { label: 'Start Service', status: 'IN_SERVICE' }
      case 'IN_SERVICE': return { label: 'Complete', status: 'COMPLETED' }
      default: return null
    }
  }

  const dateLabel = isToday(selectedDate)
    ? 'Today'
    : format(selectedDate, 'EEE, d MMM yyyy')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage and track all appointments</p>
        </div>
        <Dialog open={newApptOpen} onOpenChange={setNewApptOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="md:size-default shrink-0">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">New Appointment</span>
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
              onSuccess={() => { setNewApptOpen(false); fetchAppointments() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Navigator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-violet-500" />
            <div className="text-center">
              <p className="font-semibold text-gray-900">{dateLabel}</p>
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
          <div className="mt-3 text-center">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-violet-600 hover:underline"
            >
              Back to today
            </button>
          </div>
        )}
      </Card>

      {/* Appointments List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays className="w-12 h-12 mb-3 text-gray-200" />
            <p className="font-medium">No appointments for this day</p>
            <p className="text-sm mt-1">Book one using the button above</p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE (md+) ── */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => {
                    const StatusIcon = statusConfig[apt.status]?.icon || Clock
                    const nextAction = getNextAction(apt.status)
                    const isAssigned = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

                    return (
                      <TableRow key={apt.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-medium">{formatTime(apt.startTime)}</div>
                          <div className="text-xs text-gray-400">{apt.service?.durationMinutes} min</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{apt.customer?.name || 'Walk-in'}</div>
                          <div className="text-xs text-gray-400">{apt.customer?.phone || ''}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service?.color || '#6366f1' }} />
                            <span className="text-sm">{apt.service?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell><div className="text-sm">{apt.staff?.name || '—'}</div></TableCell>
                        <TableCell><span className="text-sm font-medium">{formatCurrency(apt.service?.price || 0)}</span></TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[apt.status]?.variant || 'outline'} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[apt.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {nextAction && isAssigned && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(apt.id, nextAction.status)}>
                                {nextAction.label}
                              </Button>
                            )}
                            {apt.status === 'CONFIRMED' && isAssigned && (
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleStatusUpdate(apt.id, 'NO_SHOW')}>
                                No Show
                              </Button>
                            )}
                            {apt.status === 'CONFIRMED' && (
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600" onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}>
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

            {/* ── MOBILE CARD LIST (< md) ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {appointments.map((apt) => {
                const StatusIcon = statusConfig[apt.status]?.icon || Clock
                const nextAction = getNextAction(apt.status)
                const isAssigned = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

                return (
                  <div key={apt.id} className="p-4 space-y-3">
                    {/* Row 1: time + status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-violet-50 rounded-lg px-3 py-1.5 text-center">
                          <p className="text-sm font-bold text-violet-700 font-mono">{formatTime(apt.startTime)}</p>
                          <p className="text-[10px] text-violet-400">{apt.service?.durationMinutes} min</p>
                        </div>
                      </div>
                      <Badge variant={statusConfig[apt.status]?.variant || 'outline'} className="gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[apt.status]?.label}
                      </Badge>
                    </div>

                    {/* Row 2: customer + service */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.customer?.name || 'Walk-in'}</p>
                        <p className="text-xs text-gray-400">{apt.customer?.phone || ''}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service?.color || '#6366f1' }} />
                          <p className="text-sm text-gray-700">{apt.service?.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{apt.staff?.name ? `with ${apt.staff.name}` : ''}</p>
                      </div>
                    </div>

                    {/* Row 3: amount + actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(apt.service?.price || 0)}</span>
                      <div className="flex gap-2">
                        {nextAction && isAssigned && (
                          <Button size="sm" onClick={() => handleStatusUpdate(apt.id, nextAction.status)}>
                            {nextAction.label}
                          </Button>
                        )}
                        {apt.status === 'CONFIRMED' && isAssigned && (
                          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleStatusUpdate(apt.id, 'NO_SHOW')}>
                            No Show
                          </Button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}>
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

// New Appointment Form
function NewAppointmentForm({
  services, staff, tenantId, onSuccess
}: {
  services: any[], staff: any[], tenantId: string, onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    staffId: '',
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Customer Name</Label>
          <Input
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input
            placeholder="9876543210"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Service *</Label>
        <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select service..." />
          </SelectTrigger>
          <SelectContent>
            {services.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {formatCurrency(s.price)} ({s.durationMinutes} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        <div className="space-y-1">
          <Label>Time</Label>
          <Input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Assign Staff (optional)</Label>
        <Select value={form.staffId} onValueChange={(v) => setForm({ ...form, staffId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Any available" />
          </SelectTrigger>
          <SelectContent>
            {staff.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedService && (
        <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-violet-700 font-medium">{selectedService.name}</span>
            <span className="font-semibold text-violet-900">{formatCurrency(selectedService.price)}</span>
          </div>
          <p className="text-xs text-violet-500 mt-1">{selectedService.durationMinutes} minutes</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </Button>
    </form>
  )
}
