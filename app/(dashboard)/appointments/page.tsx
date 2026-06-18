import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppointmentsClient } from './AppointmentsClient';

export default async function AppointmentsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const [services, staff] = await Promise.all([
        prisma.service.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' }
        }),
        prisma.user.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' }
        }),
    ]);

    return (
        <AppointmentsClient
            tenantId={tenantId}
            userId={session.user.id || ''}
            userRole={session.user.role || 'STAFF'}
            services={services}
            staff={staff}
        />
    );
}
