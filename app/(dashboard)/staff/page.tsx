import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffClient } from './StaffClient';

export default async function StaffPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    // Only OWNER and MANAGER can access staff management
    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        redirect('/');
    }

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const staff = await prisma.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
        include: {
            _count: {
                select: {
                    appointments: {
                        where: { status: 'COMPLETED' }
                    }
                }
            }
        }
    });

    return <StaffClient initialStaff={staff} tenantId={tenantId} />;
}
