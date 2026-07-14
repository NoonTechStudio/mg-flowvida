import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppointmentsClient } from './AppointmentsClient';
import { getCachedActiveServices, getCachedActiveStaff } from '@/lib/queries';

export default async function AppointmentsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const [services, staff] = await Promise.all([
        getCachedActiveServices(tenantId),
        getCachedActiveStaff(tenantId),
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
