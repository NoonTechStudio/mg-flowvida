import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServicesClient } from './ServicesClient';

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const services = await prisma.service.findMany({
        where: { tenantId },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return <ServicesClient initialServices={services} tenantId={tenantId} />;
}
