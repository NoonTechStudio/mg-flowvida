'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { format, getDaysInMonth } from 'date-fns'
import { BarChart3, Users, IndianRupee, Download, Award, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const PM_COLOR: Record<string, { badge: string; bar: string }> = {
  CASH: { badge: 'bg-emerald-100 text-emerald-700', bar: '#10b981' },
  UPI:  { badge: 'bg-blue-100 text-blue-700',       bar: '#3b82f6' },
  CARD: { badge: 'bg-violet-100 text-violet-700',   bar: '#8b5cf6' },
  PACKAGE: { badge: 'bg-amber-100 text-amber-700',  bar: '#f59e0b' },
}

interface Props {
  tenantId: string
  monthRevenue: number
  monthTransactions: any[]
  totalCustomers: number
  topServices: any[]
  staffPerformance: any[]
}

export function ReportsClient({ tenantId, monthRevenue, monthTransactions, totalCustomers, topServices, staffPerformance }: Props) {
  const now = new Date()
  const monthLabel = format(now, 'MMMM yyyy')

  // Build daily revenue for bar chart
  const daysInMonth = getDaysInMonth(now)
  const dailyRevenue: number[] = Array(daysInMonth).fill(0)
  monthTransactions.forEach(t => {
    const d = new Date(t.transactionDate).getDate() - 1
    if (d >= 0 && d < daysInMonth) dailyRevenue[d] += t.amount
  })
  const maxDay = Math.max(...dailyRevenue, 1)

  // Payment breakdown
  const payBreakdown = monthTransactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.paymentMode] = (acc[t.paymentMode] || 0) + t.amount
    return acc
  }, {})

  const exportCSV = () => {
    const rows = monthTransactions.map(t => [
      format(new Date(t.transactionDate), 'dd/MM/yyyy'),
      t.customer?.name || 'Walk-in',
      t.appointment?.service?.name || '',
      t.paymentMode,
      t.amount,
      t.invoiceNumber,
    ])
    const csv = [
      ['Date', 'Customer', 'Service', 'Payment', 'Amount', 'Invoice'].join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `revenue_${format(now, 'yyyy-MM')}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Business analytics for {monthLabel}</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* KPI cards — 3 only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<IndianRupee className="w-5 h-5" style={{ color: '#004741' }} />}
          label="Total Revenue"
          value={formatCurrency(monthRevenue)}
          sub={monthLabel}
          accent="#004741"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
          label="Transactions"
          value={String(monthTransactions.length)}
          sub="this month"
          accent="#3b82f6"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-pink-500" />}
          label="Total Customers"
          value={String(totalCustomers)}
          sub="all time"
          accent="#ec4899"
        />
      </div>

      {/* Revenue bar chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">Daily Revenue</p>
            <p className="text-xs text-gray-400">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <TrendingUp className="w-4 h-4" style={{ color: '#004741' }} />
            Peak: {formatCurrency(maxDay)}
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-28 overflow-x-auto pb-1">
          {dailyRevenue.map((v, i) => {
            const pct = maxDay > 0 ? (v / maxDay) * 100 : 0
            const isToday = i + 1 === now.getDate()
            return (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[10px] flex-1 group relative">
                {/* Tooltip */}
                {v > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-gray-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                    {format(new Date(now.getFullYear(), now.getMonth(), i + 1), 'd MMM')}: {formatCurrency(v)}
                  </div>
                )}
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(pct, v > 0 ? 4 : 1)}%`,
                    backgroundColor: isToday ? '#004741' : v > 0 ? 'rgba(0,71,65,0.45)' : '#e5e7eb',
                    minHeight: v > 0 ? 3 : 1,
                  }}
                />
                {(i + 1) % 5 === 0 || i === 0 ? (
                  <span className="text-[8px] text-gray-400 leading-none">{i + 1}</span>
                ) : <span className="text-[8px]">&nbsp;</span>}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* ── Transactions ── */}
        <TabsContent value="transactions" className="mt-4">
          <Card className="overflow-hidden">
            {monthTransactions.length === 0 ? (
              <EmptyState icon={<BarChart3 />} text="No transactions this month" />
            ) : (
              <div>
                <div className="hidden md:grid grid-cols-[120px_1fr_1fr_90px_100px_160px] text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 border-b bg-gray-50">
                  <span>Date</span><span>Customer</span><span>Service</span>
                  <span>Payment</span><span className="text-right">Amount</span><span className="text-right">Invoice</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {monthTransactions.map(t => (
                    <div key={t.id} className="grid md:grid-cols-[120px_1fr_1fr_90px_100px_160px] gap-2 md:gap-0 items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <p className="text-xs text-gray-500">{formatDate(t.transactionDate)}</p>
                      <p className="font-semibold text-sm text-gray-900">{t.customer?.name || 'Walk-in'}</p>
                      <p className="text-sm text-gray-600">{t.appointment?.service?.name || '—'}</p>
                      <div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PM_COLOR[t.paymentMode]?.badge || 'bg-gray-100 text-gray-600'}`}>
                          {t.paymentMode}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-right">{formatCurrency(t.amount)}</p>
                      <p className="text-[11px] text-gray-400 font-mono text-right truncate">{t.invoiceNumber}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t text-sm font-semibold text-gray-700">
                  <span>{monthTransactions.length} transaction{monthTransactions.length !== 1 ? 's' : ''}</span>
                  <span style={{ color: '#004741' }}>{formatCurrency(monthRevenue)}</span>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Top Services ── */}
        <TabsContent value="services" className="mt-4">
          <Card className="p-5">
            <p className="font-semibold text-gray-900 mb-4">Most Popular Services</p>
            {topServices.length === 0 ? (
              <EmptyState icon={<BarChart3 />} text="No service data yet" />
            ) : (
              <div className="space-y-4">
                {topServices.map((s, i) => {
                  const pct = Math.round((s._count.appointments / Math.max(...topServices.map((x: any) => x._count.appointments), 1)) * 100)
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? 'text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`} style={i === 0 ? { backgroundColor: '#fef3c7' } : {}}>
                            {i === 0 ? '🥇' : i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s._count.appointments} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm" style={{ color: '#004741' }}>{formatCurrency(s.price)}</p>
                          <p className="text-[11px] text-gray-400">per service</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: i === 0 ? '#004741' : `rgba(0,71,65,${0.3 + (1 - i / topServices.length) * 0.4})` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Staff Performance ── */}
        <TabsContent value="staff" className="mt-4">
          <Card className="p-5">
            <p className="font-semibold text-gray-900 mb-4">Staff Performance — {monthLabel}</p>
            {staffPerformance.length === 0 ? (
              <EmptyState icon={<Users />} text="No staff data available" />
            ) : (
              <div className="space-y-3">
                {[...staffPerformance]
                  .sort((a, b) => b._count.appointments - a._count.appointments)
                  .map((m, i) => {
                    const max = staffPerformance.reduce((mx, x) => Math.max(mx, x._count.appointments), 1)
                    const pct = Math.round((m._count.appointments / max) * 100)
                    return (
                      <div key={m.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ backgroundColor: '#004741' }}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                                {i === 0 && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    <Award className="w-2.5 h-2.5" /> Top
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 capitalize">{m.role.toLowerCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">{m._count.appointments}</p>
                            <p className="text-[11px] text-gray-400">services</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#004741' }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Payment Modes ── */}
        <TabsContent value="payments" className="mt-4">
          <Card className="p-5">
            <p className="font-semibold text-gray-900 mb-4">Payment Mode Breakdown</p>
            {Object.keys(payBreakdown).length === 0 ? (
              <EmptyState icon={<IndianRupee />} text="No payment data this month" />
            ) : (
              <div className="space-y-4">
                {Object.entries(payBreakdown)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([mode, amt]) => {
                    const pct = monthRevenue > 0 ? Math.round(((amt as number) / monthRevenue) * 100) : 0
                    const count = monthTransactions.filter(t => t.paymentMode === mode).length
                    const colors = PM_COLOR[mode] || { badge: 'bg-gray-100 text-gray-600', bar: '#9ca3af' }
                    return (
                      <div key={mode}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>{mode}</span>
                            <span className="text-xs text-gray-400">{count} transaction{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{pct}%</span>
                            <span className="font-bold text-sm text-gray-900">{formatCurrency(amt as number)}</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: colors.bar }} />
                        </div>
                      </div>
                    )
                  })}
                <div className="pt-3 border-t flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total collected</span>
                  <span className="font-bold" style={{ color: '#004741' }}>{formatCurrency(monthRevenue)}</span>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
          {icon}
        </div>
        <span className="text-xs text-gray-400">{sub}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </Card>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
      <div className="w-12 h-12 mb-3">{icon}</div>
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  )
}
