import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { WalkInButton } from '@/components/dashboard/WalkInButton';
import { OnboardingGuide } from '@/components/dashboard/OnboardingGuide';
import { BookingLinkWidget } from '@/components/dashboard/BookingLinkWidget';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <p className="text-gray-500 text-lg font-medium">Tenant not configured</p>
                </div>
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const apptInclude = {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, price: true, durationMinutes: true, color: true } },
        staff: { select: { name: true } },
    }

    const [appointments, upcomingAppointments, totalCount, completedCount, revenueResult, services, staff, totalAppointmentsEver, tenant] = await Promise.all([
        prisma.appointment.findMany({
            where: {
                tenantId,
                appointmentDate: { gte: today, lt: tomorrow },
                ...(session.user.role === 'STAFF' ? { staffId: session.user.id } : {})
            },
            include: apptInclude,
            orderBy: { startTime: 'asc' }
        }),
        // Upcoming appointments (tomorrow → next 7 days)
        prisma.appointment.findMany({
            where: {
                tenantId,
                appointmentDate: { gte: tomorrow, lt: next7Days },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                ...(session.user.role === 'STAFF' ? { staffId: session.user.id } : {})
            },
            include: apptInclude,
            orderBy: { startTime: 'asc' },
            take: 10,
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
        // Used to decide whether to show the onboarding guide
        prisma.appointment.count({ where: { tenantId } }),
        prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { businessName: true, ownerName: true, subdomain: true },
        }),
    ]);

    const isNewTenant = totalAppointmentsEver === 0;

    const dateLabel = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-5">
            {/* Onboarding guide — only for brand-new tenants with no appointments yet */}
            {isNewTenant && session.user.role !== 'STAFF' && (
                <OnboardingGuide
                    ownerName={tenant?.ownerName || session.user.name || ''}
                    parlorName={tenant?.businessName || ''}
                />
            )}

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

            {/* Online booking link — show to owner/manager only */}
            {session.user.role !== 'STAFF' && tenant?.subdomain && (
                <BookingLinkWidget subdomain={tenant.subdomain} />
            )}

            <TodayTimeline
                appointments={appointments}
                upcomingAppointments={upcomingAppointments}
                userRole={session.user.role || 'STAFF'}
                userId={session.user.id || ''}
            />
        </div>
    );
}
