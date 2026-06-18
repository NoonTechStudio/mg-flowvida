import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Next.js 16: headers() is async
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    // Get business name for header
    let businessName = 'Beauty Parlor'
    if (tenantId) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { businessName: true }
        })
        if (tenant) businessName = tenant.businessName
    }

    return (
        <DashboardShell
            userRole={session.user.role || 'STAFF'}
            user={session.user}
            businessName={businessName}
        >
            {children}
        </DashboardShell>
    );
}
