import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WalkInButton } from '@/components/dashboard/WalkInButton';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    // Next.js 16: headers() is async
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <p className="text-gray-500 text-lg font-medium">Tenant not configured</p>
                    <p className="text-gray-400 text-sm mt-2">Please run the seed script to set up demo data.</p>
                </div>
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [appointments, totalCount, completedCount, revenueResult, services, staff] = await Promise.all([
        prisma.appointment.findMany({
            where: {
                tenantId,
                appointmentDate: { gte: today, lt: tomorrow },
                ...(session.user.role === 'STAFF' ? { staffId: session.user.id } : {})
            },
            include: {
                customer: { select: { name: true, phone: true } },
                service: { select: { name: true, price: true, durationMinutes: true, color: true } },
                staff: { select: { name: true } }
            },
            orderBy: { startTime: 'asc' }
        }),
        prisma.appointment.count({
            where: { tenantId, appointmentDate: { gte: today, lt: tomorrow } }
        }),
        prisma.appointment.count({
            where: { tenantId, appointmentDate: { gte: today, lt: tomorrow }, status: 'COMPLETED' }
        }),
        prisma.transaction.aggregate({
            where: { tenantId, transactionDate: { gte: today, lt: tomorrow } },
            _sum: { amount: true }
        }),
        prisma.service.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' }
        }),
        prisma.user.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' }
        }),
    ]);

    const dateLabel = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">{dateLabel}</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                        {session.user.role === 'STAFF' ? 'Your schedule for today' : 'Business overview for today'}
                    </p>
                </div>
                <WalkInButton
                    services={services}
                    staff={staff}
                    tenantId={tenantId}
                    userId={session.user.id || ''}
                />
            </div>

            <QuickStats
                totalAppointments={totalCount}
                completedAppointments={completedCount}
                todayRevenue={revenueResult._sum.amount || 0}
            />

            <TodayTimeline
                appointments={appointments}
                userRole={session.user.role || 'STAFF'}
                userId={session.user.id || ''}
            />
        </div>
    );
}
