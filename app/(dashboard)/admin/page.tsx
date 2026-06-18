import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role === 'STAFF') {
        redirect('/dashboard');
    }

    // Next.js 16: headers() is async
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) redirect('/dashboard');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
        todayRevenue,
        todayApptCount,
        completedCount,
        monthRevenue,
        lastMonthRevenue,
        totalCustomers,
        activeStaff,
        recentTransactions,
        upcomingAppointments,
    ] = await Promise.all([
        prisma.transaction.aggregate({
            where: { tenantId, transactionDate: { gte: today, lt: tomorrow } },
            _sum: { amount: true }
        }),
        prisma.appointment.count({ where: { tenantId, appointmentDate: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { tenantId, appointmentDate: { gte: today, lt: tomorrow }, status: 'COMPLETED' } }),
        prisma.transaction.aggregate({
            where: { tenantId, transactionDate: { gte: startOfMonth } },
            _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
            where: { tenantId, transactionDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
            _sum: { amount: true }
        }),
        prisma.customer.count({ where: { tenantId } }),
        prisma.user.count({ where: { tenantId, isActive: true } }),
        prisma.transaction.findMany({
            where: { tenantId },
            include: { customer: { select: { name: true } }, appointment: { include: { service: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 8
        }),
        prisma.appointment.findMany({
            where: { tenantId, appointmentDate: { gte: today }, status: 'CONFIRMED' },
            include: {
                customer: { select: { name: true, phone: true } },
                service: { select: { name: true } },
                staff: { select: { name: true } }
            },
            orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
            take: 5
        }),
    ]);

    const todayRev = todayRevenue._sum.amount || 0;
    const monthRev = monthRevenue._sum.amount || 0;
    const lastMonthRev = lastMonthRevenue._sum.amount || 0;
    const growth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 100;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Business overview and analytics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                    <p className="text-xs text-gray-500">Today&apos;s Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todayRev)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{completedCount}/{todayApptCount} appointments</p>
                </Card>
                <Card className="p-5">
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(monthRev)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {growth >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <p className={`text-xs ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs last month
                        </p>
                    </div>
                </Card>
                <Card className="p-5">
                    <p className="text-xs text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
                    <p className="text-xs text-gray-400 mt-0.5">All time</p>
                </Card>
                <Card className="p-5">
                    <p className="text-xs text-gray-500">Active Staff</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{activeStaff}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Team members</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card className="p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                    {recentTransactions.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
                    ) : (
                        <div className="space-y-2">
                            {recentTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{t.customer?.name || 'Walk-in'}</p>
                                        <p className="text-xs text-gray-400">{t.appointment?.service?.name || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(t.amount)}</p>
                                        <p className="text-xs text-gray-400">{t.paymentMode}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Upcoming Appointments */}
                <Card className="p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingAppointments.map(apt => (
                                <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{apt.customer?.name || 'Walk-in'}</p>
                                        <p className="text-xs text-gray-400">{apt.service.name} • {apt.staff?.name || 'Any'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium">{new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        <p className="text-xs text-gray-400">{new Date(apt.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
