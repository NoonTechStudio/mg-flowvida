import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        redirect('/');
    }

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    // Get current month data
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [
        monthTransactions,
        totalCustomers,
        topServices,
        staffPerformance,
    ] = await Promise.all([
        prisma.transaction.findMany({
            where: { tenantId, transactionDate: { gte: monthStart, lte: monthEnd } },
            include: { appointment: { include: { service: true } }, customer: { select: { name: true } } },
            orderBy: { transactionDate: 'desc' }
        }),
        prisma.customer.count({ where: { tenantId } }),
        prisma.service.findMany({
            where: { tenantId },
            include: { _count: { select: { appointments: { where: { status: 'COMPLETED' } } } } },
            orderBy: { appointments: { _count: 'desc' } },
            take: 5
        }),
        prisma.user.findMany({
            where: { tenantId, isActive: true, role: { in: ['OWNER', 'MANAGER', 'STAFF'] } },
            include: {
                _count: {
                    select: {
                        appointments: { where: { status: 'COMPLETED', appointmentDate: { gte: monthStart, lte: monthEnd } } }
                    }
                }
            }
        }),
    ]);

    const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

    return (
        <ReportsClient
            tenantId={tenantId}
            monthRevenue={monthRevenue}
            monthTransactions={monthTransactions}
            totalCustomers={totalCustomers}
            topServices={topServices}
            staffPerformance={staffPerformance}
        />
    );
}
