import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServicesClient } from './ServicesClient';
import { getCachedAllServices } from '@/lib/queries';

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const services = await getCachedAllServices(tenantId);

    return <ServicesClient initialServices={services} tenantId={tenantId} />;
}
