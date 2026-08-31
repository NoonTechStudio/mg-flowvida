import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { headers } from 'next/headers';
import { getCachedTenant } from '@/lib/queries';

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    let businessName = 'Beauty Parlor'
    let subStatus: 'trial' | 'active' | 'expired' = 'active'
    let daysRemaining = 0

    if (tenantId) {
        const tenant = await getCachedTenant(tenantId)

        if (tenant) {
            businessName = tenant.businessName
            const now = new Date()
            if (now < tenant.trialEndDate) {
                subStatus = 'trial'
                daysRemaining = Math.max(
                    0,
                    Math.ceil((tenant.trialEndDate.getTime() - now.getTime()) / 86_400_000)
                )
            } else if (
                tenant.subscriptionStatus === 'active' &&
                tenant.subscriptionEndDate &&
                now < tenant.subscriptionEndDate
            ) {
                subStatus = 'active'
            } else {
                subStatus = 'expired'
            }
        }
    }

    if (subStatus === 'expired') redirect('/subscribe')

    return (
        <DashboardShell
            userRole={session.user.role || 'STAFF'}
            user={session.user}
            businessName={businessName}
            subscriptionStatus={subStatus}
            trialDaysRemaining={daysRemaining}
        >
            {children}
        </DashboardShell>
    );
}
