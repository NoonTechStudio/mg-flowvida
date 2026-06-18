import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CalendarCheck, IndianRupee, Clock, TrendingUp } from 'lucide-react'

interface QuickStatsProps {
  totalAppointments: number
  completedAppointments: number
  todayRevenue: number
  pendingAppointments?: number
}

export function QuickStats({
  totalAppointments,
  completedAppointments,
  todayRevenue,
  pendingAppointments,
}: QuickStatsProps) {
  const pending = pendingAppointments ?? totalAppointments - completedAppointments
  const completionRate = totalAppointments > 0
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0

  const stats = [
    {
      label: "Today's Appointments",
      value: totalAppointments,
      icon: CalendarCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      suffix: 'booked',
    },
    {
      label: 'Completed',
      value: completedAppointments,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      suffix: `of ${totalAppointments}`,
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      suffix: 'remaining',
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: IndianRupee,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      suffix: 'collected',
      isString: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-3 md:p-5">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-medium text-gray-500 mb-1 leading-tight">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {stat.isString ? stat.value : stat.value}
              </p>
              <p className="text-[11px] md:text-xs text-gray-400 mt-0.5">{stat.suffix}</p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-lg ${stat.bg} shrink-0`}>
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
