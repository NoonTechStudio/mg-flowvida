import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MyScheduleClient } from './MyScheduleClient';

export default async function MySchedulePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const userId = session.user.id || '';

    // Today's range in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments for this staff member
    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            staffId: userId,
            startTime: { gte: today, lt: tomorrow },
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        include: {
            service: true,
            customer: true,
        },
        orderBy: { startTime: 'asc' },
    });

    return (
        <MyScheduleClient
            appointments={appointments}
            staffName={session.user.name || 'Staff'}
            userId={userId}
        />
    );
}
