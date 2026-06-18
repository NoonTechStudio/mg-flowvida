import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CustomersClient } from './CustomersClient';

export default async function CustomersPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const customers = await prisma.customer.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { appointments: true } }
        }
    });

    return <CustomersClient initialCustomers={customers} tenantId={tenantId} />;
}
