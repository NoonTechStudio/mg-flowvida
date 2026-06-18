'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { BarChart3, TrendingUp, Users, IndianRupee, Download, Award, Scissors } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const paymentModeColor: Record<string, string> = {
  CASH: 'bg-emerald-100 text-emerald-700',
  UPI: 'bg-blue-100 text-blue-700',
  CARD: 'bg-violet-100 text-violet-700',
  PACKAGE: 'bg-amber-100 text-amber-700',
}

interface ReportsClientProps {
  tenantId: string
  monthRevenue: number
  monthTransactions: any[]
  totalCustomers: number
  topServices: any[]
  staffPerformance: any[]
}

export function ReportsClient({
  tenantId,
  monthRevenue,
  monthTransactions,
  totalCustomers,
  topServices,
  staffPerformance,
}: ReportsClientProps) {
  const now = new Date()
  const monthLabel = format(now, 'MMMM yyyy')

  const avgPerTransaction = monthTransactions.length > 0
    ? monthRevenue / monthTransactions.length
    : 0

  // Payment mode breakdown
  const paymentBreakdown = monthTransactions.reduce((acc, t) => {
    acc[t.paymentMode] = (acc[t.paymentMode] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

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
      ['Date', 'Customer', 'Service', 'Payment Mode', 'Amount', 'Invoice'].join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue_${format(now, 'yyyy-MM')}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Business analytics for {monthLabel}</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="w-5 h-5 text-violet-500" />
            <span className="text-xs text-gray-400">{monthLabel}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-400">{monthLabel}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{monthTransactions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Transactions</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgPerTransaction)}</p>
          <p className="text-xs text-gray-500 mt-1">Avg. per Transaction</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-pink-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">Total Customers</p>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="services">Top Services</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="payments">Payment Modes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            {monthTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BarChart3 className="w-12 h-12 mb-3 text-gray-200" />
                <p className="font-medium">No transactions this month</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{formatDate(t.transactionDate)}</TableCell>
                      <TableCell className="font-medium">{t.customer?.name || 'Walk-in'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{t.appointment?.service?.name || '—'}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentModeColor[t.paymentMode] || 'bg-gray-100 text-gray-600'}`}>
                          {t.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                      <TableCell className="text-xs text-gray-400 font-mono">{t.invoiceNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Most Popular Services</h3>
            {topServices.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No service data available</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={service.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{service.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">{service._count.appointments} bookings</span>
                          <span className="font-semibold text-violet-700">{formatCurrency(service.price)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full"
                          style={{ width: `${Math.min(100, (service._count.appointments / Math.max(...topServices.map((s: any) => s._count.appointments), 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Staff Performance — {monthLabel}</h3>
            {staffPerformance.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No staff data available</p>
            ) : (
              <div className="space-y-3">
                {staffPerformance
                  .sort((a, b) => b._count.appointments - a._count.appointments)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-bold text-gray-900">{member._count.appointments}</p>
                          <p className="text-xs text-gray-400">Services</p>
                        </div>
                        {index === 0 && (
                          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            <Award className="w-3 h-3" />
                            <span className="text-xs font-medium">Top</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Mode Breakdown</h3>
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No payment data for this month</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(paymentBreakdown)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([mode, amount]) => (
                    <div key={mode} className="flex items-center gap-4">
                      <div className="w-24 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentModeColor[mode] || 'bg-gray-100 text-gray-600'}`}>
                          {mode}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {monthTransactions.filter(t => t.paymentMode === mode).length} transactions
                          </span>
                          <span className="font-semibold text-gray-900">{formatCurrency(amount as number)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-400 rounded-full"
                            style={{ width: `${((amount as number) / monthRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-500 shrink-0">
                        {Math.round(((amount as number) / monthRevenue) * 100)}%
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
