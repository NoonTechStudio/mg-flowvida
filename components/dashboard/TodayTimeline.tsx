'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, UserCheck, Scissors, XCircle, AlertCircle, CalendarDays, ArrowRight } from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { formatTime, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type StatusKey = 'CONFIRMED' | 'CHECKED_IN' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

const STATUS: Record<StatusKey, { label: string; dot: string; icon: React.ElementType }> = {
  CONFIRMED:  { label: 'Confirmed',  dot: 'bg-blue-400',    icon: Clock },
  CHECKED_IN: { label: 'Checked In', dot: 'bg-amber-400',   icon: UserCheck },
  IN_SERVICE: { label: 'In Service', dot: 'bg-violet-500',  icon: Scissors },
  COMPLETED:  { label: 'Completed',  dot: 'bg-emerald-500', icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  dot: 'bg-red-400',     icon: XCircle },
  NO_SHOW:    { label: 'No Show',    dot: 'bg-gray-400',    icon: AlertCircle },
}

interface Props {
  appointments: any[]
  upcomingAppointments?: any[]
  userRole: string
  userId: string
}

export function TodayTimeline({ appointments, upcomingAppointments = [], userRole, userId }: Props) {
  const [list, setList] = useState(appointments)

  const handleStatus = async (id: string, status: string) => {
    const res = await updateAppointmentStatus(id, status)
    if (res.success) setList(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const nextAction = (status: string) => {
    if (status === 'CONFIRMED')  return { label: 'Check-in',     to: 'CHECKED_IN' }
    if (status === 'CHECKED_IN') return { label: 'Start',        to: 'IN_SERVICE' }
    if (status === 'IN_SERVICE') return { label: 'Complete',     to: 'COMPLETED' }
    return null
  }

  // Group upcoming by date label
  const grouped = upcomingAppointments.reduce<Record<string, any[]>>((acc, apt) => {
    const d = new Date(apt.appointmentDate)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0)
    const isT = d.toDateString() === tomorrow.toDateString()
    const label = isT
      ? 'Tomorrow'
      : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
    if (!acc[label]) acc[label] = []
    acc[label].push(apt)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Today's Timeline */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Today's Timeline</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,71,65,0.08)', color: '#004741' }}>
            {list.length} appt{list.length !== 1 ? 's' : ''}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-400">
            <CalendarDays className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-sm font-medium">No appointments today</p>
            <Link href="/dashboard/appointments">
              <button className="mt-3 text-xs font-medium flex items-center gap-1" style={{ color: '#004741' }}>
                Book an appointment <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {list.map(apt => {
              const s = apt.status as StatusKey
              const cfg = STATUS[s] || STATUS.CONFIRMED
              const Icon = cfg.icon
              const next = nextAction(apt.status)
              const canAct = !apt.staffId || apt.staffId === userId || userRole !== 'STAFF'

              return (
                <div key={apt.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* Time column */}
                  <div className="shrink-0 text-right min-w-[52px]">
                    <p className="font-mono font-semibold text-sm leading-tight">{formatTime(apt.startTime)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{apt.service?.durationMinutes}m</p>
                  </div>

                  {/* Status dot */}
                  <div className="flex flex-col items-center pt-1.5 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <div className="w-px flex-1 bg-gray-100 mt-1" style={{ minHeight: '24px' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-tight">{apt.customer?.name || 'Walk-in'}</p>
                        {apt.customer?.phone && (
                          <p className="text-[11px] text-gray-400 font-mono">{apt.customer.phone}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {apt.service?.color && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: apt.service.color }} />
                          )}
                          <p className="text-xs text-gray-500">{apt.service?.name}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs font-semibold text-gray-700">{formatCurrency(apt.service?.price || 0)}</p>
                        </div>
                        {apt.staff && (
                          <p className="text-[11px] text-gray-400 mt-0.5">with {apt.staff.name}</p>
                        )}
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        s === 'IN_SERVICE' ? 'bg-violet-50 text-violet-700' :
                        s === 'CHECKED_IN' ? 'bg-amber-50 text-amber-700' :
                        s === 'CANCELLED' ? 'bg-red-50 text-red-500' :
                        s === 'NO_SHOW' ? 'bg-gray-100 text-gray-500' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    {canAct && (next || apt.status === 'CONFIRMED') && (
                      <div className="flex gap-1.5 mt-2">
                        {next && (
                          <Button size="sm" className="h-6 text-[11px] px-2.5"
                            onClick={() => handleStatus(apt.id, next.to)}>
                            {next.label}
                          </Button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-red-500 hover:bg-red-50"
                            onClick={() => handleStatus(apt.id, 'NO_SHOW')}>
                            No Show
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Upcoming by date groups */}
      {Object.keys(grouped).length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Coming Up</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              Next 7 days
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.entries(grouped).map(([dateLabel, apts]) => (
              <div key={dateLabel}>
                {/* Date separator */}
                <div className="flex items-center gap-3 px-5 py-2 bg-gray-50/60">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{dateLabel}</span>
                  <span className="ml-auto text-[10px] text-gray-400">{apts.length} appt{apts.length !== 1 ? 's' : ''}</span>
                </div>
                {apts.map(apt => {
                  const s = apt.status as StatusKey
                  const cfg = STATUS[s] || STATUS.CONFIRMED

                  return (
                    <div key={apt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                      <div className="shrink-0 min-w-[52px] text-right">
                        <p className="font-mono text-xs font-semibold text-gray-700">{formatTime(apt.startTime)}</p>
                        <p className="text-[10px] text-gray-400">{apt.service?.durationMinutes}m</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{apt.customer?.name || 'Walk-in'}</p>
                        <div className="flex items-center gap-1.5">
                          {apt.service?.color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: apt.service.color }} />}
                          <p className="text-xs text-gray-500">{apt.service?.name} · {formatCurrency(apt.service?.price || 0)}</p>
                        </div>
                      </div>
                      {apt.staff && (
                        <p className="text-[11px] text-gray-400 shrink-0">with {apt.staff.name}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
