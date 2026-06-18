'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { formatTime, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Clock, CheckCircle, XCircle, AlertCircle, UserCheck,
  Scissors, Phone, CalendarCheck, ChevronRight, PartyPopper
} from 'lucide-react'

type StatusKey = 'CONFIRMED' | 'CHECKED_IN' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

const statusConfig: Record<StatusKey, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  CONFIRMED:  { label: 'Confirmed',  color: 'text-blue-700',    bg: 'bg-blue-50',   icon: Clock },
  CHECKED_IN: { label: 'Checked In', color: 'text-amber-700',   bg: 'bg-amber-50',  icon: UserCheck },
  IN_SERVICE: { label: 'In Service', color: 'text-violet-700',  bg: 'bg-violet-50', icon: Scissors },
  COMPLETED:  { label: 'Completed',  color: 'text-emerald-700', bg: 'bg-emerald-50',icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-600',     bg: 'bg-red-50',    icon: XCircle },
  NO_SHOW:    { label: 'No Show',    color: 'text-gray-500',    bg: 'bg-gray-50',   icon: AlertCircle },
}

// What the next tap action should be for each status
const nextAction: Partial<Record<StatusKey, { label: string; next: StatusKey; className: string }>> = {
  CONFIRMED:  { label: '✓ Check In',       next: 'CHECKED_IN', className: 'bg-amber-500 hover:bg-amber-600 text-white' },
  CHECKED_IN: { label: '✂ Start Service',  next: 'IN_SERVICE', className: 'bg-violet-600 hover:bg-violet-700 text-white' },
  IN_SERVICE: { label: '✓ Mark Complete',  next: 'COMPLETED',  className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
}

interface Appointment {
  id: string
  startTime: Date
  status: string
  service: { name: string; durationMinutes: number; price: number; color?: string | null } | null
  customer: { name: string; phone: string } | null
}

interface MyScheduleClientProps {
  appointments: Appointment[]
  staffName: string
  userId: string
}

export function MyScheduleClient({ appointments: initial, staffName }: MyScheduleClientProps) {
  const [appointments, setAppointments] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatus = async (id: string, status: string) => {
    setLoading(id)
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    }
    setLoading(null)
  }

  const active = appointments.filter(a => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status))
  const done = appointments.filter(a => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status))
  const totalRevenue = appointments
    .filter(a => a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (a.service?.price || 0), 0)

  const today = format(new Date(), 'EEEE, d MMMM')

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">My Schedule</h1>
        <p className="text-sm text-gray-500">Hi {staffName} 👋 — {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700">
          <CalendarCheck className="w-3.5 h-3.5 text-violet-500" />
          {active.length} remaining
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          {done.filter(a => a.status === 'COMPLETED').length} completed
        </div>
        {totalRevenue > 0 && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700">
            <span className="text-emerald-500 font-bold">₹</span>
            {formatCurrency(totalRevenue)} earned
          </div>
        )}
      </div>

      {/* No appointments */}
      {appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <PartyPopper className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Free day!</p>
          <p className="text-sm text-gray-400 mt-1">No appointments scheduled for today.</p>
        </div>
      )}

      {/* Active appointments */}
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Up Next</p>
          {active.map((apt) => {
            const status = apt.status as StatusKey
            const cfg = statusConfig[status]
            const action = nextAction[status]
            const StatusIcon = cfg?.icon || Clock

            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Colour accent bar */}
                <div className="h-1" style={{ backgroundColor: apt.service?.color || '#d42a14' }} />

                <div className="p-4 space-y-3">
                  {/* Time + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-mono font-bold text-gray-900">{formatTime(apt.startTime)}</span>
                      <span className="text-xs text-gray-400">· {apt.service?.durationMinutes} min</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg?.bg} ${cfg?.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg?.label}
                    </span>
                  </div>

                  {/* Customer + service */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{apt.customer?.name || 'Walk-in'}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {apt.customer?.phone || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{apt.service?.name}</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(apt.service?.price || 0)}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {action && (
                    <button
                      disabled={loading === apt.id}
                      onClick={() => handleStatus(apt.id, action.next)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-opacity ${action.className} ${loading === apt.id ? 'opacity-60' : ''}`}
                    >
                      {loading === apt.id ? 'Updating…' : action.label}
                    </button>
                  )}

                  {/* Secondary actions */}
                  {status === 'CONFIRMED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-red-500 hover:bg-red-50 text-xs"
                        disabled={loading === apt.id}
                        onClick={() => handleStatus(apt.id, 'NO_SHOW')}
                      >
                        No Show
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-gray-400 text-xs"
                        disabled={loading === apt.id}
                        onClick={() => handleStatus(apt.id, 'CANCELLED')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed / past */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Done</p>
          {done.map((apt) => {
            const status = apt.status as StatusKey
            const cfg = statusConfig[status]
            const StatusIcon = cfg?.icon || CheckCircle
            return (
              <div key={apt.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 opacity-70">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg?.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${cfg?.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{apt.customer?.name || 'Walk-in'}</p>
                  <p className="text-xs text-gray-400">{apt.service?.name} · {formatTime(apt.startTime)}</p>
                </div>
                <span className={`text-xs font-semibold ${cfg?.color}`}>{cfg?.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
